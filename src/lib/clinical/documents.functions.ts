import { createServerFn } from "@tanstack/react-start";
import type {
  DocumentAnalysis,
  DocumentDetail,
  DocumentFact,
  DocumentReading,
  DocumentRow,
  DocumentType,
} from "./documents.types";

/**
 * Typed RPC boundary for uploaded documents. All OCR and AI work happens inside
 * these handlers; no provider key ever reaches the browser.
 */

const str = (value: unknown, field: string) => {
  if (typeof value !== "string" || value.trim().length === 0)
    throw new Error(`${field} is required`);
  return value.trim();
};

const DOCUMENT_TYPES = [
  "prescription",
  "lab_report",
  "medical_report",
  "discharge_summary",
  "previous_consultation",
  "other",
];

const docType = (value: unknown): DocumentType =>
  (DOCUMENT_TYPES.includes(String(value)) ? String(value) : "other") as DocumentType;

async function service() {
  return await import("./documents.server");
}

async function clinician() {
  const { requireClinician } = await import("./auth.server");
  return await requireClinician();
}

function decode(base64: string): Uint8Array {
  const clean = base64.includes(",") ? (base64.split(",")[1] ?? "") : base64;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

/** Stores the uploaded file against the patient's open check-in. */
export const uploadDocument = createServerFn({ method: "POST" })
  .validator(
    (input: {
      encounterId: string;
      fileName: string;
      mimeType: string;
      documentType: string;
      base64: string;
      source?: string;
    }) => ({
      encounterId: str(input?.encounterId, "The check-in"),
      fileName: str(input?.fileName, "The file name").slice(0, 200),
      mimeType: str(input?.mimeType, "The file type").toLowerCase(),
      documentType: docType(input?.documentType),
      base64: str(input?.base64, "The file"),
      source: input?.source === "assisted-kiosk" ? "assisted-kiosk" : "patient-kiosk",
    }),
  )
  .handler(async ({ data }): Promise<DocumentRow> => {
    const { createDocument } = await service();
    return await createDocument({
      encounterId: data.encounterId,
      fileName: data.fileName,
      mimeType: data.mimeType,
      bytes: decode(data.base64),
      documentType: data.documentType,
      source: data.source,
    });
  });

/** Reads the document: OCR first, then assisted extraction. */
export const processDocument = createServerFn({ method: "POST" })
  .validator((input: { documentId: string }) => ({
    documentId: str(input?.documentId, "The document"),
  }))
  .handler(async ({ data }) => (await service()).processDocument(data.documentId));

export const listEncounterDocuments = createServerFn({ method: "GET" })
  .validator((input: { encounterId: string }) => ({
    encounterId: str(input?.encounterId, "The check-in"),
  }))
  .handler(async ({ data }): Promise<DocumentRow[]> =>
    (await service()).listDocumentsForEncounter(data.encounterId),
  );

/** Clinician-only: one document with its OCR text, extraction and candidates. */
export const getDocument = createServerFn({ method: "GET" })
  .validator((input: { documentId: string }) => ({
    documentId: str(input?.documentId, "The document"),
  }))
  .handler(async ({ data }): Promise<DocumentDetail> => {
    const user = await clinician();
    const api = await service();
    await api.recordDocumentViewed(data.documentId, user.label);
    return api.getDocumentDetail(data.documentId);
  });

/** Clinician-only: candidate items awaiting review for one encounter. */
export const listCandidateFacts = createServerFn({ method: "GET" })
  .validator((input: { encounterId: string }) => ({
    encounterId: str(input?.encounterId, "The encounter"),
  }))
  .handler(async ({ data }): Promise<DocumentFact[]> => {
    await clinician();
    return (await service()).listCandidateFacts(data.encounterId);
  });

/** Clinician-only: confirm, correct, reject or flag one candidate item. */
export const reviewFact = createServerFn({ method: "POST" })
  .validator((input: { factId: string; action: string; correctedValue?: string }) => ({
    factId: str(input?.factId, "The item"),
    action: (["confirm", "correct", "reject", "uncertain"].includes(String(input?.action))
      ? String(input?.action)
      : "confirm") as "confirm" | "correct" | "reject" | "uncertain",
    ...(input?.correctedValue ? { correctedValue: input.correctedValue.slice(0, 240) } : {}),
  }))
  .handler(async ({ data }): Promise<DocumentFact> => {
    const user = await clinician();
    return (await service()).reviewFact({ ...data, reviewer: user.label });
  });

/** Clinician/staff attestation after every extracted item has a decision. */
export const completeDocumentReview = createServerFn({ method: "POST" })
  .validator((input: { documentId: string; emptyExtractionChecked?: boolean }) => ({
    documentId: str(input?.documentId, "The document"),
    emptyExtractionChecked: input?.emptyExtractionChecked === true,
  }))
  .handler(async ({ data }): Promise<DocumentRow> => {
    const user = await clinician();
    return (await service()).completeDocumentReview({ ...data, reviewer: user.label });
  });

/** Clinician-only: retry the assisted extraction after a failure. */
export const retryExtraction = createServerFn({ method: "POST" })
  .validator((input: { documentId: string }) => ({
    documentId: str(input?.documentId, "The document"),
  }))
  .handler(async ({ data }) => {
    const user = await clinician();
    return (await service()).processDocument(data.documentId, user.label);
  });

/**
 * The signed-in patient's own documents. The patient is resolved on the server;
 * a patient id from the browser is never trusted.
 */
export const listMyDocuments = createServerFn({ method: "GET" }).handler(
  async (): Promise<DocumentRow[]> => {
    const api = await service();
    const { resolveOwnPatientId } = await import("./patient-identity.server");
    return api.listDocumentsForPatient(await resolveOwnPatientId());
  },
);

/**
 * Reads one file on its own — real OCR and real assisted structuring — without
 * attaching it to any patient record. Used by the document-check page.
 */
export const analyzeDocument = createServerFn({ method: "POST" })
  .validator(
    (input: { fileName: string; mimeType: string; documentType?: string; base64: string }) => ({
      fileName: str(input?.fileName, "The file name").slice(0, 200),
      mimeType: str(input?.mimeType, "The file type").toLowerCase(),
      documentType: docType(input?.documentType ?? "prescription"),
      base64: str(input?.base64, "The file"),
    }),
  )
  .handler(async ({ data }): Promise<DocumentAnalysis> => {
    const { analyzeDocumentInMemory } = await service();
    return await analyzeDocumentInMemory({
      fileName: data.fileName,
      mimeType: data.mimeType,
      bytes: decode(data.base64),
      documentType: data.documentType,
    });
  });

/** The text and structured reading of every document on one check-in. */
export const listEncounterDocumentReadings = createServerFn({ method: "GET" })
  .validator((input: { encounterId: string }) => ({
    encounterId: str(input?.encounterId, "The check-in"),
  }))
  .handler(async ({ data }): Promise<DocumentReading[]> =>
    (await service()).listDocumentReadingsForEncounter(data.encounterId),
  );

/** Recent documents across the clinic — used by the staff workspace. */
export const listRecentDocuments = createServerFn({ method: "GET" }).handler(
  async (): Promise<DocumentRow[]> => {
    await clinician();
    return (await service()).listRecentDocuments(40);
  },
);
