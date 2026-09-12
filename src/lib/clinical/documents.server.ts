import { ClinicalError, db } from "./clinical.server";
import { EXTRACTION_MODEL, EXTRACTION_SCHEMA_VERSION, extractDocument } from "./gemini.server";
import { OCR_MAX_BYTES, OCR_SUPPORTED, OcrError, runOcr } from "./ocr.server";
import type {
  DocumentDetail,
  DocumentExtractionBody,
  DocumentExtractionRow,
  DocumentFact,
  DocumentOcrRow,
  DocumentRow,
  DocumentStatus,
  DocumentType,
} from "./documents.types";

/**
 * The document lifecycle: upload → OCR (OCR.space) → assisted extraction
 * (Gemini) → candidate facts → clinician review. Every step is persisted, and a
 * failure at any step is recorded honestly instead of being reported as success.
 */

type Row = Record<string, unknown>;

const text = (value: unknown) => String(value ?? "");
const num = (value: unknown) => Number(value ?? 0);
const nullable = (value: unknown) => (value === null || value === undefined ? null : String(value));

const DOCUMENT_TYPES: DocumentType[] = [
  "prescription",
  "lab_report",
  "medical_report",
  "discharge_summary",
  "previous_consultation",
  "other",
];

/** Files are kept as their own row, not inside the clinical tables. */
export const MAX_UPLOAD_BYTES = OCR_MAX_BYTES;

let schema: Promise<void> | null = null;

async function documentsDb() {
  const client = await db();
  if (!schema) {
    schema = (async () => {
      await client.batch(
        [
          `CREATE TABLE IF NOT EXISTS patient_documents (
            id TEXT PRIMARY KEY,
            patient_id TEXT NOT NULL,
            encounter_id TEXT,
            file_name TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            storage_key TEXT NOT NULL,
            document_type TEXT NOT NULL,
            source TEXT NOT NULL,
            status TEXT NOT NULL,
            error_code TEXT,
            fingerprint TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
          )`,
          `CREATE UNIQUE INDEX IF NOT EXISTS documents_fingerprint
             ON patient_documents (fingerprint) WHERE fingerprint IS NOT NULL`,
          `CREATE TABLE IF NOT EXISTS document_files (
            storage_key TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            bytes BLOB NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          )`,
          `CREATE TABLE IF NOT EXISTS document_ocr_results (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL UNIQUE,
            provider TEXT NOT NULL,
            provider_version TEXT NOT NULL,
            raw_text TEXT NOT NULL,
            page_count INTEGER NOT NULL DEFAULT 1,
            confidence REAL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          )`,
          `CREATE TABLE IF NOT EXISTS document_extractions (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL UNIQUE,
            patient_id TEXT NOT NULL,
            encounter_id TEXT,
            model TEXT NOT NULL,
            model_version TEXT NOT NULL,
            schema_version TEXT NOT NULL,
            status TEXT NOT NULL,
            error_message TEXT,
            structured_json TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
          )`,
        ],
        "write",
      );
      // Facts gained a document origin and a review trail; older databases are
      // migrated in place.
      for (const column of [
        "document_id TEXT",
        "ai_value TEXT",
        "corrected_value TEXT",
        "review TEXT",
        "reviewed_by TEXT",
        "reviewed_at TEXT",
      ]) {
        try {
          await client.execute(`ALTER TABLE clinical_facts ADD COLUMN ${column}`);
        } catch {
          /* the column already exists */
        }
      }
    })().catch((error) => {
      schema = null;
      throw error;
    });
  }
  await schema;
  return client;
}

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`.toUpperCase();

async function audit(input: {
  encounterId: string | null;
  patientId: string | null;
  action: string;
  actor: string;
}) {
  const client = await documentsDb();
  await client.execute({
    sql: "INSERT INTO audit_events (encounter_id, patient_id, action, actor) VALUES (?,?,?,?)",
    args: [input.encounterId, input.patientId, input.action, input.actor],
  });
}

async function setStatus(documentId: string, status: DocumentStatus, errorCode: string | null) {
  const client = await documentsDb();
  await client.execute({
    sql: "UPDATE patient_documents SET status = ?, error_code = ?, updated_at = datetime('now') WHERE id = ?",
    args: [status, errorCode, documentId],
  });
}

function toDocument(row: Row): DocumentRow {
  return {
    id: text(row["id"]),
    patientId: text(row["patient_id"]),
    encounterId: nullable(row["encounter_id"]),
    fileName: text(row["file_name"]),
    mimeType: text(row["mime_type"]),
    fileSize: num(row["file_size"]),
    storageKey: text(row["storage_key"]),
    documentType: text(row["document_type"]) as DocumentType,
    source: text(row["source"]),
    status: text(row["status"]) as DocumentStatus,
    errorCode: nullable(row["error_code"]),
    createdAt: text(row["created_at"]),
    updatedAt: text(row["updated_at"]),
  };
}

function toOcr(row: Row): DocumentOcrRow {
  return {
    id: text(row["id"]),
    documentId: text(row["document_id"]),
    provider: text(row["provider"]),
    providerVersion: text(row["provider_version"]),
    rawText: text(row["raw_text"]),
    pageCount: num(row["page_count"]),
    confidence: row["confidence"] === null ? null : num(row["confidence"]),
    createdAt: text(row["created_at"]),
  };
}

function toExtraction(row: Row): DocumentExtractionRow {
  const json = nullable(row["structured_json"]);
  return {
    id: text(row["id"]),
    documentId: text(row["document_id"]),
    patientId: text(row["patient_id"]),
    encounterId: nullable(row["encounter_id"]),
    model: text(row["model"]),
    modelVersion: text(row["model_version"]),
    schemaVersion: text(row["schema_version"]),
    status: text(row["status"]) as DocumentExtractionRow["status"],
    errorMessage: nullable(row["error_message"]),
    body: json ? (JSON.parse(json) as DocumentExtractionBody) : null,
    createdAt: text(row["created_at"]),
    updatedAt: text(row["updated_at"]),
  };
}

function toFact(row: Row): DocumentFact {
  const aiValue = nullable(row["ai_value"]);
  return {
    id: text(row["id"]),
    documentId: nullable(row["document_id"]),
    encounterId: text(row["encounter_id"]),
    category: text(row["category"]),
    field: text(row["field"]),
    aiValue: aiValue ?? text(row["display_value"]),
    displayValue: text(row["display_value"]),
    correctedValue: nullable(row["corrected_value"]),
    certainty: text(row["certainty"]),
    evidence: text(row["source_text"]),
    status: text(row["status"]) as DocumentFact["status"],
    review: nullable(row["review"]),
    reviewedBy: nullable(row["reviewed_by"]),
    reviewedAt: nullable(row["reviewed_at"]),
    createdAt: text(row["created_at"]),
  };
}

/* -------------------------------------------------------------------- upload */

/**
 * Records one uploaded file. The same upload retried (same encounter, name,
 * size and content length) returns the existing document instead of a copy.
 */
export async function createDocument(input: {
  encounterId: string | null;
  patientId?: string | undefined;
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
  documentType: DocumentType;
  source: string;
}): Promise<DocumentRow> {
  const client = await documentsDb();

  if (!OCR_SUPPORTED[input.mimeType.toLowerCase()]) {
    throw new ClinicalError(
      "UNSUPPORTED_DOCUMENT",
      "Please upload a PDF, JPG, PNG or WebP file",
      415,
    );
  }
  if (input.bytes.byteLength === 0) {
    throw new ClinicalError("INVALID", "This file is empty", 422);
  }
  if (input.bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new ClinicalError(
      "DOCUMENT_TOO_LARGE",
      `Please upload a file smaller than ${Math.round(MAX_UPLOAD_BYTES / 1024)} KB`,
      413,
    );
  }

  let patientId = input.patientId ?? null;
  if (input.encounterId) {
    const found = await client.execute({
      sql: "SELECT patient_id FROM encounters WHERE id = ?",
      args: [input.encounterId],
    });
    const row = found.rows[0] as Row | undefined;
    if (!row) throw new ClinicalError("NOT_FOUND", "This check-in no longer exists", 404);
    patientId = text(row["patient_id"]);
  }
  if (!patientId) throw new ClinicalError("INVALID", "A patient is required", 422);

  const documentType = DOCUMENT_TYPES.includes(input.documentType) ? input.documentType : "other";
  const fingerprint = [
    input.encounterId ?? patientId,
    input.fileName.slice(0, 120),
    input.bytes.byteLength,
    documentType,
  ].join("|");

  const existing = await client.execute({
    sql: "SELECT * FROM patient_documents WHERE fingerprint = ? LIMIT 1",
    args: [fingerprint],
  });
  const existingRow = existing.rows[0] as Row | undefined;
  if (existingRow) return toDocument(existingRow);

  const documentId = newId("DOC");
  const storageKey = `${patientId}/${documentId}/${input.fileName.replace(/[^\w.-]+/g, "_").slice(0, 80)}`;

  await client.execute({
    sql: `INSERT INTO patient_documents
            (id, patient_id, encounter_id, file_name, mime_type, file_size, storage_key,
             document_type, source, status, fingerprint)
          VALUES (?,?,?,?,?,?,?,?,?,'UPLOADING',?)`,
    args: [
      documentId,
      patientId,
      input.encounterId,
      input.fileName.slice(0, 200),
      input.mimeType,
      input.bytes.byteLength,
      storageKey,
      documentType,
      input.source,
      fingerprint,
    ],
  });

  await client.execute({
    sql: "INSERT INTO document_files (storage_key, document_id, mime_type, bytes) VALUES (?,?,?,?)",
    args: [storageKey, documentId, input.mimeType, input.bytes],
  });

  await setStatus(documentId, "UPLOADED", null);
  await audit({
    encounterId: input.encounterId,
    patientId,
    action: "DOCUMENT_UPLOADED",
    actor: input.source,
  });

  return await requireDocument(documentId);
}

export async function requireDocument(documentId: string): Promise<DocumentRow> {
  const client = await documentsDb();
  const result = await client.execute({
    sql: "SELECT * FROM patient_documents WHERE id = ? LIMIT 1",
    args: [documentId],
  });
  const row = result.rows[0] as Row | undefined;
  if (!row) throw new ClinicalError("NOT_FOUND", "That document does not exist", 404);
  return toDocument(row);
}

/** The stored file itself, for the document viewer. */
export async function readDocumentFile(documentId: string) {
  const client = await documentsDb();
  const document = await requireDocument(documentId);
  const result = await client.execute({
    sql: "SELECT bytes, mime_type FROM document_files WHERE document_id = ? LIMIT 1",
    args: [documentId],
  });
  const row = result.rows[0] as Row | undefined;
  if (!row) throw new ClinicalError("NOT_FOUND", "The stored file is missing", 404);
  const raw = row["bytes"];
  const bytes =
    raw instanceof Uint8Array
      ? raw
      : raw instanceof ArrayBuffer
        ? new Uint8Array(raw)
        : new Uint8Array(0);
  return { document, bytes, mimeType: text(row["mime_type"]) };
}

/* ------------------------------------------------------- OCR then extraction */

async function saveOcr(documentId: string, result: Awaited<ReturnType<typeof runOcr>>) {
  const client = await documentsDb();
  await client.execute({
    sql: `INSERT INTO document_ocr_results
            (id, document_id, provider, provider_version, raw_text, page_count, confidence)
          VALUES (?,?,?,?,?,?,?)
          ON CONFLICT (document_id) DO UPDATE SET
            provider = excluded.provider,
            provider_version = excluded.provider_version,
            raw_text = excluded.raw_text,
            page_count = excluded.page_count,
            confidence = excluded.confidence`,
    args: [
      newId("OCR"),
      documentId,
      result.provider,
      result.providerVersion,
      result.rawText,
      result.pageCount,
      result.confidence,
    ],
  });
}

/** Candidate facts from a document extraction. Never confirmed automatically. */
async function saveCandidateFacts(document: DocumentRow, body: DocumentExtractionBody) {
  const client = await documentsDb();
  if (!document.encounterId) return 0;

  const rows: Array<{ category: string; field: string; value: string; evidence: string }> = [];
  const addEvidenceItems = (
    items: Array<{ value: string; evidence: string | null }> | undefined,
    category: string,
    field: string,
  ) => {
    for (const item of items ?? []) {
      rows.push({ category, field, value: item.value, evidence: item.evidence ?? "" });
    }
  };
  const addValue = (value: string | null | undefined, category: string, field: string) => {
    if (value?.trim()) rows.push({ category, field, value, evidence: value });
  };

  addValue(body.documentType, "OTHER", "Document type");
  addValue(body.documentDate, "OTHER", "Document date");
  addValue(body.hospitalOrClinic, "OTHER", "Hospital or clinic");
  addValue(body.doctorName, "OTHER", "Doctor name");
  addValue(body.patientName, "OTHER", "Patient name on document");
  addEvidenceItems(body.patientIdentifiers, "OTHER", "Patient identifier");

  for (const item of body.medications ?? []) {
    const label = [item.medication, item.dose, item.frequency].filter(Boolean).join(" ");
    rows.push({
      category: "MEDICATION",
      field: "Medication",
      value: label,
      evidence: item.evidence ?? "",
    });
  }
  addEvidenceItems(body.allergiesMentioned, "ALLERGY", "Allergy");
  addEvidenceItems(body.diagnosesMentioned, "PAST_HISTORY", "Diagnosis recorded in document");
  addEvidenceItems(body.symptomsMentioned, "SYMPTOM", "Symptom in document");
  for (const item of body.labResults ?? [])
    rows.push({
      category: "OTHER",
      field: `Lab: ${item.test}`,
      value: [item.value, item.unit].filter(Boolean).join(" ") || item.test,
      evidence: item.evidence ?? "",
    });
  addEvidenceItems(body.vitalValues, "VITAL", "Measurement in document");
  addEvidenceItems(body.procedures, "OTHER", "Procedure");
  addEvidenceItems(body.investigations, "OTHER", "Investigation");
  addEvidenceItems(body.recommendationsMentioned, "OTHER", "Recommendation in document");
  addEvidenceItems(body.importantFindings, "OTHER", "Important finding");
  addValue(body.followUpInformation, "OTHER", "Follow-up information");
  for (const item of body.uncertainItems ?? []) {
    addValue(item, "OTHER", "Uncertain OCR item");
  }

  // A re-run replaces earlier unreviewed candidates from this document only.
  await client.execute({
    sql: "DELETE FROM clinical_facts WHERE document_id = ? AND status = 'candidate' AND reviewed_at IS NULL",
    args: [document.id],
  });

  const usable = rows.filter((row) => row.value.trim().length > 0).slice(0, 60);
  if (usable.length === 0) return 0;

  await client.batch(
    usable.map((row) => ({
      sql: `INSERT INTO clinical_facts
              (id, encounter_id, answer_id, document_id, category, field, value, display_value,
               ai_value, certainty, source_text, status)
            VALUES (?,?,NULL,?,?,?,?,?,?,'IMPLIED',?,'candidate')`,
      args: [
        newId("MK-F"),
        document.encounterId,
        document.id,
        row.category,
        row.field,
        row.value,
        row.value,
        row.value,
        row.evidence,
      ],
    })),
    "write",
  );
  return usable.length;
}

/**
 * Reads one document end to end. OCR text is stored before the AI step, so a
 * failed extraction never loses it and can be retried on its own.
 */
export async function processDocument(documentId: string, actor = "patient-kiosk") {
  const client = await documentsDb();
  const document = await requireDocument(documentId);

  const existingOcr = await client.execute({
    sql: "SELECT * FROM document_ocr_results WHERE document_id = ? LIMIT 1",
    args: [documentId],
  });
  let ocrText = existingOcr.rows[0] ? toOcr(existingOcr.rows[0] as Row).rawText : null;

  if (!ocrText) {
    await setStatus(documentId, "OCR_PROCESSING", null);
    await audit({
      encounterId: document.encounterId,
      patientId: document.patientId,
      action: "OCR_STARTED",
      actor,
    });
    try {
      const file = await readDocumentFile(documentId);
      const result = await runOcr({
        bytes: file.bytes,
        fileName: document.fileName,
        mimeType: document.mimeType,
      });
      await saveOcr(documentId, result);
      ocrText = result.rawText;
      await setStatus(documentId, "OCR_COMPLETED", null);
      await audit({
        encounterId: document.encounterId,
        patientId: document.patientId,
        action: "OCR_COMPLETED",
        actor,
      });
    } catch (error) {
      const code = error instanceof OcrError ? error.code : "OCR_FAILED";
      await setStatus(documentId, "FAILED", code);
      await audit({
        encounterId: document.encounterId,
        patientId: document.patientId,
        action: "OCR_FAILED",
        actor,
      });
      return {
        status: "FAILED" as const,
        stage: "ocr" as const,
        errorCode: code,
        message: error instanceof Error ? error.message : "This document could not be read",
      };
    }
  }

  await setStatus(documentId, "EXTRACTION_PROCESSING", null);
  await audit({
    encounterId: document.encounterId,
    patientId: document.patientId,
    action: "AI_EXTRACTION_STARTED",
    actor,
  });

  try {
    const body = await extractDocument({ ocrText, documentType: document.documentType });
    await client.execute({
      sql: `INSERT INTO document_extractions
              (id, document_id, patient_id, encounter_id, model, model_version, schema_version,
               status, error_message, structured_json)
            VALUES (?,?,?,?,?,?,?, 'COMPLETED', NULL, ?)
            ON CONFLICT (document_id) DO UPDATE SET
              status = 'COMPLETED',
              error_message = NULL,
              structured_json = excluded.structured_json,
              model = excluded.model,
              model_version = excluded.model_version,
              schema_version = excluded.schema_version,
              updated_at = datetime('now')`,
      args: [
        newId("EXT"),
        documentId,
        document.patientId,
        document.encounterId,
        EXTRACTION_MODEL,
        EXTRACTION_MODEL,
        EXTRACTION_SCHEMA_VERSION,
        JSON.stringify(body),
      ],
    });
    const candidateCount = await saveCandidateFacts(document, body);
    await setStatus(documentId, "READY_FOR_REVIEW", null);
    await audit({
      encounterId: document.encounterId,
      patientId: document.patientId,
      action: "AI_EXTRACTION_COMPLETED",
      actor,
    });
    return { status: "READY_FOR_REVIEW" as const, stage: "extraction" as const, candidateCount };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Assisted extraction failed";
    await client.execute({
      sql: `INSERT INTO document_extractions
              (id, document_id, patient_id, encounter_id, model, model_version, schema_version,
               status, error_message, structured_json)
            VALUES (?,?,?,?,?,?,?, 'FAILED', ?, NULL)
            ON CONFLICT (document_id) DO UPDATE SET
              status = 'FAILED', error_message = excluded.error_message, updated_at = datetime('now')`,
      args: [
        newId("EXT"),
        documentId,
        document.patientId,
        document.encounterId,
        EXTRACTION_MODEL,
        EXTRACTION_MODEL,
        EXTRACTION_SCHEMA_VERSION,
        message,
      ],
    });
    // The OCR text stays available; only the AI step is marked unavailable.
    await setStatus(documentId, "OCR_COMPLETED", "AI_EXTRACTION_FAILED");
    await audit({
      encounterId: document.encounterId,
      patientId: document.patientId,
      action: "AI_EXTRACTION_FAILED",
      actor,
    });
    return {
      status: "OCR_COMPLETED" as const,
      stage: "extraction" as const,
      errorCode: "AI_EXTRACTION_FAILED",
      message,
    };
  }
}

/* --------------------------------------------------------------------- reads */

export async function listDocumentsForEncounter(encounterId: string): Promise<DocumentRow[]> {
  const client = await documentsDb();
  const result = await client.execute({
    sql: "SELECT * FROM patient_documents WHERE encounter_id = ? ORDER BY created_at DESC",
    args: [encounterId],
  });
  return result.rows.map((row) => toDocument(row as Row));
}

export async function listDocumentsForPatient(patientId: string): Promise<DocumentRow[]> {
  const client = await documentsDb();
  const result = await client.execute({
    sql: "SELECT * FROM patient_documents WHERE patient_id = ? ORDER BY created_at DESC",
    args: [patientId],
  });
  return result.rows.map((row) => toDocument(row as Row));
}

export async function getDocumentDetail(documentId: string): Promise<DocumentDetail> {
  const client = await documentsDb();
  const document = await requireDocument(documentId);
  const [ocr, extraction, facts] = await Promise.all([
    client.execute({
      sql: "SELECT * FROM document_ocr_results WHERE document_id = ? LIMIT 1",
      args: [documentId],
    }),
    client.execute({
      sql: "SELECT * FROM document_extractions WHERE document_id = ? LIMIT 1",
      args: [documentId],
    }),
    client.execute({
      sql: "SELECT * FROM clinical_facts WHERE document_id = ? ORDER BY created_at ASC",
      args: [documentId],
    }),
  ]);
  return {
    document,
    ocr: ocr.rows[0] ? toOcr(ocr.rows[0] as Row) : null,
    extraction: extraction.rows[0] ? toExtraction(extraction.rows[0] as Row) : null,
    facts: facts.rows.map((row) => toFact(row as Row)),
  };
}

/** Every AI-assisted candidate fact for an encounter, with its review state. */
export async function listCandidateFacts(encounterId: string): Promise<DocumentFact[]> {
  const client = await documentsDb();
  const result = await client.execute({
    sql: "SELECT * FROM clinical_facts WHERE encounter_id = ? AND status != 'discarded' ORDER BY created_at ASC",
    args: [encounterId],
  });
  return result.rows.map((row) => toFact(row as Row));
}

/* -------------------------------------------------------------------- review */

/**
 * The clinician's decision on one AI-assisted candidate. The original AI value
 * is preserved; a correction is stored alongside it.
 */
export async function reviewFact(input: {
  factId: string;
  action: "confirm" | "correct" | "reject" | "uncertain";
  correctedValue?: string | undefined;
  reviewer: string;
}): Promise<DocumentFact> {
  const client = await documentsDb();
  const found = await client.execute({
    sql: "SELECT * FROM clinical_facts WHERE id = ? LIMIT 1",
    args: [input.factId],
  });
  const row = found.rows[0] as Row | undefined;
  if (!row) throw new ClinicalError("NOT_FOUND", "That item does not exist", 404);
  const fact = toFact(row);

  const aiValue = fact.aiValue;
  let status: DocumentFact["status"] = fact.status;
  let displayValue = fact.displayValue;
  let correctedValue = fact.correctedValue;
  let action = "";

  if (input.action === "confirm") {
    status = "confirmed";
    action = "FACT_CONFIRMED";
  } else if (input.action === "correct") {
    const value = (input.correctedValue ?? "").trim();
    if (!value) throw new ClinicalError("INVALID", "A corrected value is required", 422);
    status = "confirmed";
    displayValue = value.slice(0, 240);
    correctedValue = displayValue;
    action = "FACT_CORRECTED";
  } else if (input.action === "reject") {
    status = "discarded";
    action = "FACT_REJECTED";
  } else {
    status = "candidate";
    action = "FACT_MARKED_UNCERTAIN";
  }

  await client.execute({
    sql: `UPDATE clinical_facts SET
            status = ?, display_value = ?, corrected_value = ?,
            ai_value = COALESCE(ai_value, ?), review = ?, reviewed_by = ?,
            reviewed_at = datetime('now')
          WHERE id = ?`,
    args: [
      status,
      displayValue,
      correctedValue,
      aiValue,
      input.action,
      input.reviewer,
      input.factId,
    ],
  });

  await audit({
    encounterId: fact.encounterId,
    patientId: null,
    action,
    actor: input.reviewer,
  });

  if (fact.documentId) {
    // Any changed decision re-opens the document until the reviewer explicitly
    // completes the whole checklist.
    await client.execute({
      sql: "UPDATE patient_documents SET status = 'READY_FOR_REVIEW', updated_at = datetime('now') WHERE id = ?",
      args: [fact.documentId],
    });
  }

  const updated = await client.execute({
    sql: "SELECT * FROM clinical_facts WHERE id = ? LIMIT 1",
    args: [input.factId],
  });
  return toFact(updated.rows[0] as Row);
}

/** Explicitly attests that the original document and every detected item were checked. */
export async function completeDocumentReview(input: {
  documentId: string;
  reviewer: string;
  emptyExtractionChecked: boolean;
}): Promise<DocumentRow> {
  const client = await documentsDb();
  const document = await requireDocument(input.documentId);
  if (document.status === "REVIEWED") return document;
  if (document.status !== "READY_FOR_REVIEW") {
    throw new ClinicalError("INVALID", "This document is not ready for review", 422);
  }

  const counts = await client.execute({
    sql: `SELECT COUNT(*) AS total,
                 SUM(CASE WHEN reviewed_at IS NULL THEN 1 ELSE 0 END) AS pending
          FROM clinical_facts WHERE document_id = ?`,
    args: [input.documentId],
  });
  const countRow = counts.rows[0] as Row;
  const total = num(countRow["total"]);
  const pending = num(countRow["pending"]);
  if (pending > 0) {
    throw new ClinicalError("REVIEW_INCOMPLETE", `${pending} detected item(s) still need a decision`, 422);
  }
  if (total === 0 && !input.emptyExtractionChecked) {
    throw new ClinicalError(
      "REVIEW_INCOMPLETE",
      "Confirm that you checked the original document before completing this review",
      422,
    );
  }

  await client.execute({
    sql: "UPDATE patient_documents SET status = 'REVIEWED', error_code = NULL, updated_at = datetime('now') WHERE id = ?",
    args: [input.documentId],
  });
  await audit({
    encounterId: document.encounterId,
    patientId: document.patientId,
    action: "DOCUMENT_REVIEW_COMPLETED",
    actor: input.reviewer,
  });
  return await requireDocument(input.documentId);
}

/** Recorded when a clinician opens the original file. */
export async function recordDocumentViewed(documentId: string, actor: string) {
  const document = await requireDocument(documentId);
  await audit({
    encounterId: document.encounterId,
    patientId: document.patientId,
    action: "DOCUMENT_VIEWED",
    actor,
  });
}

/* ------------------------------------------------- one-off document checking */

/**
 * Reads one file and organises it without attaching it to a patient record.
 * Used by the standalone document-check page: real OCR and real assisted
 * structuring, nothing stored, nothing confirmed.
 */
export async function analyzeDocumentInMemory(input: {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
  documentType: DocumentType;
}) {
  if (!OCR_SUPPORTED[input.mimeType.toLowerCase()]) {
    throw new ClinicalError(
      "UNSUPPORTED_DOCUMENT",
      "Please upload a PDF, JPG, PNG or WebP file",
      415,
    );
  }
  if (input.bytes.byteLength === 0) throw new ClinicalError("INVALID", "This file is empty", 422);
  if (input.bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new ClinicalError(
      "DOCUMENT_TOO_LARGE",
      `Please upload a file smaller than ${Math.round(MAX_UPLOAD_BYTES / 1024)} KB`,
      413,
    );
  }

  const documentType = DOCUMENT_TYPES.includes(input.documentType) ? input.documentType : "other";

  let ocr: Awaited<ReturnType<typeof runOcr>>;
  try {
    ocr = await runOcr({
      bytes: input.bytes,
      fileName: input.fileName,
      mimeType: input.mimeType,
    });
  } catch (error) {
    throw new ClinicalError(
      error instanceof OcrError ? error.code : "OCR_FAILED",
      error instanceof Error ? error.message : "This document could not be read",
      422,
    );
  }

  let structured: DocumentExtractionBody | null = null;
  let structuringError: string | null = null;
  try {
    structured = await extractDocument({ ocrText: ocr.rawText, documentType });
  } catch (error) {
    structuringError = error instanceof Error ? error.message : "Assisted structuring failed";
  }

  return {
    fileName: input.fileName,
    mimeType: input.mimeType,
    fileSize: input.bytes.byteLength,
    documentType,
    provider: ocr.provider,
    pageCount: ocr.pageCount,
    confidence: ocr.confidence,
    rawText: ocr.rawText,
    structured,
    structuringError,
  };
}

/**
 * The OCR text and structured reading of every document on one check-in, for
 * the patient's own read-back. No review state and no file contents.
 */
export async function listDocumentReadingsForEncounter(encounterId: string) {
  const client = await documentsDb();
  const documents = await listDocumentsForEncounter(encounterId);
  if (documents.length === 0) return [];
  return await Promise.all(
    documents.map(async (document) => {
      const [ocr, extraction] = await Promise.all([
        client.execute({
          sql: "SELECT * FROM document_ocr_results WHERE document_id = ? LIMIT 1",
          args: [document.id],
        }),
        client.execute({
          sql: "SELECT * FROM document_extractions WHERE document_id = ? LIMIT 1",
          args: [document.id],
        }),
      ]);
      const extractionRow = extraction.rows[0] ? toExtraction(extraction.rows[0] as Row) : null;
      return {
        document,
        rawText: ocr.rows[0] ? toOcr(ocr.rows[0] as Row).rawText : null,
        structured: extractionRow?.body ?? null,
        structuringFailed: extractionRow?.status === "FAILED",
      };
    }),
  );
}

/** Most recent documents across the clinic, for the staff workspace. */
export async function listRecentDocuments(limit = 40): Promise<DocumentRow[]> {
  const client = await documentsDb();
  const result = await client.execute({
    sql: "SELECT * FROM patient_documents ORDER BY created_at DESC LIMIT ?",
    args: [Math.min(Math.max(limit, 1), 100)],
  });
  return result.rows.map((row) => toDocument(row as Row));
}
