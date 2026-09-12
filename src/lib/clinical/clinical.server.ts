import { getDb } from "@/lib/db.server";
import { extractFacts, generateSummary } from "./gemini.server";
import type {
  AnswerRow,
  AuditRow,
  EncounterDetail,
  EncounterRow,
  FactRow,
  PatientRow,
  SummaryBody,
  SummaryRow,
} from "./types";

/**
 * The clinical record. One patient owns encounters; one encounter owns the
 * intake answers, the extracted/confirmed information, the summary versions and
 * the audit trail. Every surface of MediKiosk reads these same rows.
 */

type Row = Record<string, unknown>;

const text = (value: unknown) => String(value ?? "");
const num = (value: unknown) => Number(value ?? 0);
const nullable = (value: unknown) => (value === null || value === undefined ? null : String(value));

export class ClinicalError extends Error {
  status: number;
  code: string;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

let schema: Promise<void> | null = null;

/** Ensures the clinical tables exist, then returns the database client. */
export async function db() {
  const client = await getDb();
  if (!schema) {
    schema = (async () => {
      await client.batch(
        [
          `CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            age INTEGER NOT NULL DEFAULT 0,
            language TEXT NOT NULL DEFAULT 'hi',
            phone TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          )`,
          `CREATE TABLE IF NOT EXISTS encounters (
            id TEXT PRIMARY KEY,
            patient_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'in-progress',
            chief_complaint TEXT,
            started_at TEXT NOT NULL DEFAULT (datetime('now')),
            completed_at TEXT,
            signed_at TEXT,
            token TEXT
          )`,
          `CREATE TABLE IF NOT EXISTS intake_answers (
            id TEXT PRIMARY KEY,
            encounter_id TEXT NOT NULL,
            question_id TEXT NOT NULL,
            question_text TEXT NOT NULL,
            transcript TEXT NOT NULL,
            language TEXT NOT NULL,
            source TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'captured',
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            UNIQUE (encounter_id, question_id)
          )`,
          `CREATE TABLE IF NOT EXISTS clinical_facts (
            id TEXT PRIMARY KEY,
            encounter_id TEXT NOT NULL,
            answer_id TEXT,
            category TEXT NOT NULL,
            field TEXT NOT NULL,
            value TEXT NOT NULL,
            display_value TEXT NOT NULL,
            certainty TEXT NOT NULL,
            source_text TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'candidate',
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          )`,
          `CREATE TABLE IF NOT EXISTS summaries (
            id TEXT PRIMARY KEY,
            encounter_id TEXT NOT NULL,
            version INTEGER NOT NULL,
            status TEXT NOT NULL,
            author TEXT NOT NULL,
            body TEXT NOT NULL,
            source_fact_ids TEXT NOT NULL DEFAULT '[]',
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            UNIQUE (encounter_id, version)
          )`,
          `CREATE TABLE IF NOT EXISTS audit_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            encounter_id TEXT,
            patient_id TEXT,
            action TEXT NOT NULL,
            actor TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          )`,
        ],
        "write",
      );
      // Links a patient record to the signed-in account that owns it.
      await client
        .execute("ALTER TABLE patients ADD COLUMN account_id TEXT")
        .catch(() => undefined);
    })().catch((error) => {
      schema = null;
      throw error;
    });
  }
  await schema;
  return client;
}

const id = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`.toUpperCase();

async function audit(
  encounterId: string | null,
  patientId: string | null,
  action: string,
  actor: string,
) {
  const client = await db();
  await client.execute({
    sql: "INSERT INTO audit_events (encounter_id, patient_id, action, actor) VALUES (?,?,?,?)",
    args: [encounterId, patientId, action, actor],
  });
}

/* ------------------------------------------------------------------ patients */

/** The patient record already linked to this signed-in account, if any. */
export async function findPatientByAccount(accountId: string): Promise<string | null> {
  const client = await db();
  const found = await client.execute({
    sql: "SELECT id FROM patients WHERE account_id = ? LIMIT 1",
    args: [accountId],
  });
  const row = found.rows[0] as Row | undefined;
  return row ? text(row["id"]) : null;
}

/**
 * Links the patient behind a finished check-in to the signed-in account, so the
 * person sees their own visit in their records. A record that already belongs
 * to another account is never re-assigned.
 */
export async function claimEncounterForAccount(
  encounterId: string,
  accountId: string,
): Promise<string | null> {
  const client = await db();
  const found = await client.execute({
    sql: `SELECT p.id AS id, p.account_id AS account_id
          FROM encounters e JOIN patients p ON p.id = e.patient_id
          WHERE e.id = ? LIMIT 1`,
    args: [encounterId],
  });
  const row = found.rows[0] as Row | undefined;
  if (!row) return null;
  const patientId = text(row["id"]);
  const owner = row["account_id"] ? text(row["account_id"]) : null;
  if (owner && owner !== accountId) return null;
  if (!owner) {
    await client.execute({
      sql: "UPDATE patients SET account_id = ? WHERE id = ?",
      args: [accountId, patientId],
    });
  }
  return patientId;
}


export async function resolvePatient(input: {
  name?: string | undefined;
  age?: number | undefined;
  language: "hi" | "en";
  phone?: string | undefined;
}) {
  const client = await db();
  const name = (input.name ?? "").trim();
  const phone = (input.phone ?? "").trim();

  // If a valid phone number is provided, match returning patient by phone
  if (phone && phone.length >= 7) {
    const existing = await client.execute({
      sql: "SELECT * FROM patients WHERE phone = ? LIMIT 1",
      args: [phone],
    });
    const row = existing.rows[0] as Row | undefined;
    if (row) {
      await client.execute({
        sql: "UPDATE patients SET name = COALESCE(NULLIF(?,''), name), age = COALESCE(NULLIF(?,0), age), language = ? WHERE id = ?",
        args: [name, input.age ?? 0, input.language, text(row["id"])],
      });
      return text(row["id"]);
    }
  }

  // Create an isolated patient record for this check-in
  const patientId = id("MK-P");
  await client.execute({
    sql: "INSERT INTO patients (id, name, age, language, phone) VALUES (?,?,?,?,?)",
    args: [patientId, name || "Patient", input.age ?? 0, input.language, phone || null],
  });
  return patientId;
}

/* ---------------------------------------------------------------- encounters */

/** Reuses the patient's open encounter if explicitly provided, otherwise creates an isolated one. */
export async function startEncounter(input: {
  name?: string | undefined;
  age?: number | undefined;
  phone?: string | undefined;
  language: "hi" | "en";
  encounterId?: string | undefined;
}) {
  const client = await db();

  if (input.encounterId) {
    const found = await client.execute({
      sql: "SELECT * FROM encounters WHERE id = ? AND status = 'in-progress' LIMIT 1",
      args: [input.encounterId],
    });
    const row = found.rows[0] as Row | undefined;
    if (row) {
      return {
        encounterId: text(row["id"]),
        patientId: text(row["patient_id"]),
        resumed: true,
      };
    }
  }

  const patientId = await resolvePatient(input);
  const encounterId = id("MK-E");
  const token = encounterId.slice(-6);
  await client.execute({
    sql: "INSERT INTO encounters (id, patient_id, status, token) VALUES (?,?,'in-progress',?)",
    args: [encounterId, patientId, token],
  });
  await audit(encounterId, patientId, "INTAKE_STARTED", "patient-kiosk");
  return { encounterId, patientId, resumed: false };
}

export async function updatePatientDetails(
  encounterId: string,
  details: { name?: string; age?: number; phone?: string; language?: "hi" | "en" },
) {
  const client = await db();
  const found = await client.execute({
    sql: "SELECT patient_id FROM encounters WHERE id = ?",
    args: [encounterId],
  });
  const row = found.rows[0] as Row | undefined;
  if (!row) throw new ClinicalError("NOT_FOUND", "This check-in no longer exists", 404);
  const patientId = text(row["patient_id"]);
  const name = (details.name ?? "").trim();
  const phone = (details.phone ?? "").trim();

  await client.execute({
    sql: `UPDATE patients SET
            name = COALESCE(NULLIF(?,''), name),
            age = COALESCE(NULLIF(?,0), age),
            phone = COALESCE(NULLIF(?,''), phone),
            language = COALESCE(?, language)
          WHERE id = ?`,
    args: [name, details.age ?? 0, phone || null, details.language ?? null, patientId],
  });
  return patientId;
}


function toEncounter(row: Row): EncounterRow {
  return {
    id: text(row["id"]),
    patientId: text(row["patient_id"]),
    patientName: text(row["name"]),
    age: num(row["age"]),
    language: (text(row["language"]) === "en" ? "en" : "hi") as "hi" | "en",
    status: text(row["status"]) as EncounterRow["status"],
    chiefComplaint: nullable(row["chief_complaint"]),
    startedAt: text(row["started_at"]),
    completedAt: nullable(row["completed_at"]),
    signedAt: nullable(row["signed_at"]),
    answerCount: num(row["answer_count"]),
    confirmedFactCount: num(row["fact_count"]),
  };
}

const ENCOUNTER_SELECT = `
  SELECT e.*, p.name, p.age, p.language,
    (SELECT COUNT(*) FROM intake_answers a WHERE a.encounter_id = e.id) AS answer_count,
    (SELECT COUNT(*) FROM clinical_facts f WHERE f.encounter_id = e.id AND f.status = 'confirmed') AS fact_count
  FROM encounters e JOIN patients p ON p.id = e.patient_id`;

export async function listEncounters(): Promise<EncounterRow[]> {
  const client = await db();
  const result = await client.execute(
    `${ENCOUNTER_SELECT} WHERE NOT (lower(p.name) = 'patient' AND (p.age = 0 OR e.chief_complaint IS NULL)) ORDER BY e.started_at DESC`
  );
  return result.rows.map((row) => toEncounter(row as Row));
}

export async function listPatientEncounters(patientId: string): Promise<EncounterRow[]> {
  const client = await db();
  const result = await client.execute({
    sql: `${ENCOUNTER_SELECT} WHERE e.patient_id = ? ORDER BY e.started_at DESC`,
    args: [patientId],
  });
  return result.rows.map((row) => toEncounter(row as Row));
}

async function requireEncounter(encounterId: string): Promise<EncounterRow> {
  const client = await db();
  const result = await client.execute({
    sql: `${ENCOUNTER_SELECT} WHERE e.id = ? LIMIT 1`,
    args: [encounterId],
  });
  const row = result.rows[0] as Row | undefined;
  if (!row) throw new ClinicalError("NOT_FOUND", "This encounter does not exist", 404);
  return toEncounter(row);
}

/* ------------------------------------------------------------------- answers */

function toAnswer(row: Row): AnswerRow {
  return {
    id: text(row["id"]),
    encounterId: text(row["encounter_id"]),
    questionId: text(row["question_id"]),
    questionText: text(row["question_text"]),
    transcript: text(row["transcript"]),
    language: (text(row["language"]) === "en" ? "en" : "hi") as "hi" | "en",
    source: (text(row["source"]) === "typed" ? "typed" : "voice") as "voice" | "typed",
    status: text(row["status"]) as AnswerRow["status"],
    createdAt: text(row["created_at"]),
  };
}

function toFact(row: Row): FactRow {
  return {
    id: text(row["id"]),
    encounterId: text(row["encounter_id"]),
    answerId: nullable(row["answer_id"]),
    category: text(row["category"]),
    field: text(row["field"]),
    value: text(row["value"]),
    displayValue: text(row["display_value"]),
    certainty: text(row["certainty"]) as FactRow["certainty"],
    sourceText: text(row["source_text"]),
    status: text(row["status"]) as FactRow["status"],
    createdAt: text(row["created_at"]),
  };
}

/**
 * Saves what the patient actually said, then asks Gemini for candidate
 * structured information. The transcript is stored before any AI call, so an AI
 * failure can never lose the patient's own words.
 */
export async function saveAnswer(input: {
  encounterId: string;
  questionId: string;
  questionText: string;
  transcript: string;
  language: "hi" | "en";
  source: "voice" | "typed";
}) {
  const client = await db();
  await requireEncounter(input.encounterId);
  const transcript = input.transcript.trim();
  if (!transcript) throw new ClinicalError("INVALID", "An answer is required", 422);

  const existing = await client.execute({
    sql: "SELECT id, transcript FROM intake_answers WHERE encounter_id = ? AND question_id = ?",
    args: [input.encounterId, input.questionId],
  });
  const previous = existing.rows[0] as Row | undefined;
  const answerId = previous ? text(previous["id"]) : id("MK-A");
  const corrected = Boolean(previous) && text(previous?.["transcript"]) !== transcript;

  if (previous) {
    await client.execute({
      sql: `UPDATE intake_answers SET question_text = ?, transcript = ?, language = ?, source = ?,
              status = CASE WHEN transcript = ? THEN status ELSE 'captured' END
            WHERE id = ?`,
      args: [input.questionText, transcript, input.language, input.source, transcript, answerId],
    });
  } else {
    await client.execute({
      sql: `INSERT INTO intake_answers (id, encounter_id, question_id, question_text, transcript, language, source)
            VALUES (?,?,?,?,?,?,?)`,
      args: [
        answerId,
        input.encounterId,
        input.questionId,
        input.questionText,
        transcript,
        input.language,
        input.source,
      ],
    });
  }

  if (corrected || !previous) {
    await client.execute({
      sql: "DELETE FROM clinical_facts WHERE answer_id = ? AND status != 'confirmed'",
      args: [answerId],
    });
    await client.execute({
      sql: "UPDATE clinical_facts SET status = 'discarded' WHERE answer_id = ? AND status = 'confirmed'",
      args: [answerId],
    });
  }

  await audit(
    input.encounterId,
    null,
    corrected ? "ANSWER_CORRECTED" : "ANSWER_CREATED",
    "patient-kiosk",
  );

  const NON_CLINICAL = new Set([
    "name",
    "age",
    "gender",
    "phone",
    "height",
    "weight",
    "pulse",
    "temperature",
    "paperTypes",
    "bp",
    "bloodPressure",
    "systolic",
    "diastolic",
    "spo2",
    "respiratoryRate",
    "bmi",
  ]);

  // Candidate extraction. A failure here is reported, never faked.
  let aiError: string | null = null;
  let clarification: string | null = null;
  const isClinical = !NON_CLINICAL.has(input.questionId) && transcript.length >= 3;

  if (isClinical && (!previous || corrected)) {
    try {
      const extraction = await extractFacts({
        questionText: input.questionText,
        answer: transcript,
        language: input.language,
      });
      clarification = extraction.clarificationQuestion;

      // Stale check: check if the answer's current transcript in DB is still what we processed.
      // If a newer user keystroke/edit has already updated this answer, discard the stale extraction!
      const currentAns = await client.execute({
        sql: "SELECT transcript FROM intake_answers WHERE id = ?",
        args: [answerId],
      });
      const latestTranscript = text(currentAns.rows[0]?.["transcript"]).trim();
      if (latestTranscript !== transcript) {
        return { answerId, candidates: [], clarification: null, aiError: null };
      }

      // Atomically clean up prior unconfirmed facts for this answer before inserting new ones
      await client.execute({
        sql: "DELETE FROM clinical_facts WHERE answer_id = ? AND status != 'confirmed'",
        args: [answerId],
      });

      // The same point can come up in several answers ("headache" in the
      // concern and again in the story). It is recorded once per check-in.
      const already = await client.execute({
        sql: `SELECT category, display_value FROM clinical_facts
              WHERE encounter_id = ? AND status != 'discarded' AND answer_id != ?`,
        args: [input.encounterId, answerId],
      });
      const seen = new Set(
        already.rows.map((row) =>
          `${text((row as Row)["category"])}|${text((row as Row)["display_value"])}`
            .trim()
            .toLowerCase(),
        ),
      );
      const newFacts = extraction.facts.filter((fact) => {
        const key = `${fact.category}|${fact.displayValue}`.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (newFacts.length > 0) {
        await client.batch(
          newFacts.map((fact) => ({
            sql: `INSERT INTO clinical_facts
                  (id, encounter_id, answer_id, category, field, value, display_value, certainty, source_text, status)
                  VALUES (?,?,?,?,?,?,?,?,?,'candidate')`,
            args: [
              id("MK-F"),
              input.encounterId,
              answerId,
              fact.category,
              fact.field,
              fact.value,
              fact.displayValue,
              fact.certainty,
              fact.sourceText,
            ],
          })),
          "write",
        );
      }
    } catch (error) {
      aiError = error instanceof Error ? error.message : "Assisted processing failed";
    }
  }

  const candidates = await client.execute({
    sql: "SELECT * FROM clinical_facts WHERE answer_id = ? AND status IN ('candidate','confirmed') ORDER BY created_at ASC",
    args: [answerId],
  });

  return {
    answerId,
    candidates: candidates.rows.map((row) => toFact(row as Row)),
    clarification,
    aiError,
  };
}

/** The patient said the read-back is right: candidates become confirmed. */
export async function confirmAnswer(input: { encounterId: string; questionId: string }) {
  const client = await db();
  const found = await client.execute({
    sql: "SELECT id FROM intake_answers WHERE encounter_id = ? AND question_id = ?",
    args: [input.encounterId, input.questionId],
  });
  const row = found.rows[0] as Row | undefined;
  if (!row) throw new ClinicalError("NOT_FOUND", "That answer was not found", 404);
  const answerId = text(row["id"]);

  await client.batch(
    [
      {
        sql: "UPDATE intake_answers SET status = 'confirmed' WHERE id = ?",
        args: [answerId],
      },
      {
        sql: "UPDATE clinical_facts SET status = 'confirmed' WHERE answer_id = ? AND status = 'candidate'",
        args: [answerId],
      },
    ],
    "write",
  );
  await audit(input.encounterId, null, "ANSWER_CONFIRMED", "patient-kiosk");
  return { answerId, confirmed: true as const };
}

export async function listAnswers(encounterId: string): Promise<AnswerRow[]> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT * FROM intake_answers WHERE encounter_id = ? ORDER BY created_at ASC",
    args: [encounterId],
  });
  return result.rows.map((row) => toAnswer(row as Row));
}

export async function listFacts(encounterId: string): Promise<FactRow[]> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT * FROM clinical_facts WHERE encounter_id = ? AND status != 'discarded' ORDER BY created_at ASC",
    args: [encounterId],
  });
  return result.rows.map((row) => toFact(row as Row));
}

/* ----------------------------------------------------------------- summaries */

function toSummary(row: Row): SummaryRow {
  return {
    id: text(row["id"]),
    encounterId: text(row["encounter_id"]),
    version: num(row["version"]),
    status: text(row["status"]) as SummaryRow["status"],
    author: text(row["author"]),
    body: JSON.parse(text(row["body"] || "{}")) as SummaryBody,
    sourceFactIds: JSON.parse(text(row["source_fact_ids"] || "[]")) as string[],
    createdAt: text(row["created_at"]),
  };
}

export async function listSummaries(encounterId: string): Promise<SummaryRow[]> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT * FROM summaries WHERE encounter_id = ? ORDER BY version ASC",
    args: [encounterId],
  });
  return result.rows.map((row) => toSummary(row as Row));
}

async function insertSummary(
  encounterId: string,
  status: SummaryRow["status"],
  author: string,
  body: SummaryBody,
  sourceFactIds: string[],
) {
  const client = await db();
  const existing = await listSummaries(encounterId);
  const version = (existing.at(-1)?.version ?? 0) + 1;
  const summaryId = id("MK-S");
  await client.execute({
    sql: `INSERT INTO summaries (id, encounter_id, version, status, author, body, source_fact_ids)
          VALUES (?,?,?,?,?,?,?)`,
    args: [
      summaryId,
      encounterId,
      version,
      status,
      author,
      JSON.stringify(body),
      JSON.stringify(sourceFactIds),
    ],
  });
  return { id: summaryId, version };
}

/**
 * Finishes the intake: reads the stored answers and confirmed information back
 * out of the database, asks Gemini for a draft, and puts the encounter on the
 * clinician worklist. Nothing here is invented from frontend state.
 */
export async function completeIntake(input: { encounterId: string }) {
  const client = await db();
  const encounter = await requireEncounter(input.encounterId);
  const [answers, facts] = await Promise.all([
    listAnswers(input.encounterId),
    listFacts(input.encounterId),
  ]);
  if (answers.length === 0) {
    throw new ClinicalError("INVALID", "No answers were recorded for this check-in", 422);
  }

  const confirmedFacts = facts.filter((fact) => fact.status === "confirmed");
  const usable = confirmedFacts.length > 0 ? confirmedFacts : facts;
  const chief =
    usable.find((fact) => fact.category === "SYMPTOM")?.displayValue ??
    answers[0]?.transcript.slice(0, 120) ??
    null;

  let summary: { id: string; version: number } | null = null;
  let aiError: string | null = null;
  try {
    const body = await generateSummary({
      patient: {
        name: encounter.patientName,
        age: encounter.age,
        language: encounter.language === "hi" ? "Hindi" : "English",
      },
      facts: usable.map((fact) => ({
        category: fact.category,
        field: fact.field,
        displayValue: fact.displayValue,
      })),
      statements: answers.map((answer) => ({
        question: answer.questionText,
        answer: answer.transcript,
      })),
    });
    summary = await insertSummary(
      input.encounterId,
      "AI_DRAFT",
      "MediKiosk assisted draft",
      body,
      usable.map((fact) => fact.id),
    );
    await audit(input.encounterId, encounter.patientId, "SUMMARY_GENERATED", "assisted-draft");
  } catch (error) {
    aiError = error instanceof Error ? error.message : "Assisted summary failed";
  }

  await client.execute({
    sql: `UPDATE encounters SET status = 'ready-for-review', completed_at = datetime('now'),
            chief_complaint = COALESCE(chief_complaint, ?) WHERE id = ?`,
    args: [chief, input.encounterId],
  });
  await audit(input.encounterId, encounter.patientId, "INTAKE_COMPLETED", "patient-kiosk");

  return {
    encounterId: input.encounterId,
    summaryVersion: summary?.version ?? null,
    aiError,
    answerCount: answers.length,
    confirmedFactCount: confirmedFacts.length,
  };
}

/** Regenerates an assisted draft from the stored confirmed information. */
export async function regenerateSummary(encounterId: string) {
  const encounter = await requireEncounter(encounterId);
  const [answers, facts] = await Promise.all([listAnswers(encounterId), listFacts(encounterId)]);
  const usable = facts.filter((fact) => fact.status === "confirmed");
  const body = await generateSummary({
    patient: {
      name: encounter.patientName,
      age: encounter.age,
      language: encounter.language === "hi" ? "Hindi" : "English",
    },
    facts: (usable.length > 0 ? usable : facts).map((fact) => ({
      category: fact.category,
      field: fact.field,
      displayValue: fact.displayValue,
    })),
    statements: answers.map((answer) => ({
      question: answer.questionText,
      answer: answer.transcript,
    })),
  });
  const created = await insertSummary(
    encounterId,
    "AI_DRAFT",
    "MediKiosk assisted draft",
    body,
    (usable.length > 0 ? usable : facts).map((fact) => fact.id),
  );
  await audit(encounterId, encounter.patientId, "SUMMARY_GENERATED", "assisted-draft");
  return created;
}

/** Clinician edit. Creates a new version; the assisted draft is never lost. */
export async function saveClinicianSummary(input: {
  encounterId: string;
  expectedVersion: number;
  body: SummaryBody;
  author: string;
}) {
  const versions = await listSummaries(input.encounterId);
  const latest = versions.at(-1);
  if (!latest) throw new ClinicalError("NOT_FOUND", "There is no summary to edit", 404);
  if (latest.status === "SIGNED") {
    throw new ClinicalError("CONFLICT", "This summary is already signed", 409);
  }
  if (latest.version !== input.expectedVersion) {
    throw new ClinicalError(
      "STALE_VERSION",
      "This summary changed since you opened it. Reload to see the current version.",
      409,
    );
  }
  const created = await insertSummary(
    input.encounterId,
    "CLINICIAN_EDITED",
    input.author,
    input.body,
    latest.sourceFactIds,
  );
  await audit(input.encounterId, null, "SUMMARY_EDITED", input.author);
  return created;
}

/** Attestation. Signs the current version and closes the encounter. */
export async function signSummary(input: {
  encounterId: string;
  expectedVersion: number;
  author: string;
}) {
  const client = await db();
  const encounter = await requireEncounter(input.encounterId);
  const versions = await listSummaries(input.encounterId);
  const latest = versions.at(-1);
  if (!latest) throw new ClinicalError("NOT_FOUND", "There is no summary to sign", 404);
  if (latest.status === "SIGNED") {
    throw new ClinicalError("CONFLICT", "This summary is already signed", 409);
  }
  if (latest.version !== input.expectedVersion) {
    throw new ClinicalError(
      "STALE_VERSION",
      "This summary changed since you opened it. Reload to see the current version.",
      409,
    );
  }
  const created = await insertSummary(
    input.encounterId,
    "SIGNED",
    input.author,
    latest.body,
    latest.sourceFactIds,
  );
  await client.execute({
    sql: "UPDATE encounters SET status = 'completed', signed_at = datetime('now') WHERE id = ?",
    args: [input.encounterId],
  });
  await audit(input.encounterId, encounter.patientId, "SUMMARY_SIGNED", input.author);
  return created;
}

/* --------------------------------------------------------------------- reads */

export async function listAudit(encounterId: string): Promise<AuditRow[]> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT * FROM audit_events WHERE encounter_id = ? ORDER BY id ASC",
    args: [encounterId],
  });
  return result.rows.map((row) => ({
    id: num((row as Row)["id"]),
    encounterId: nullable((row as Row)["encounter_id"]),
    patientId: nullable((row as Row)["patient_id"]),
    action: text((row as Row)["action"]),
    actor: text((row as Row)["actor"]),
    createdAt: text((row as Row)["created_at"]),
  }));
}

export async function getEncounterDetail(encounterId: string): Promise<EncounterDetail> {
  const [encounter, answers, facts, summaries, auditTrail] = await Promise.all([
    requireEncounter(encounterId),
    listAnswers(encounterId),
    listFacts(encounterId),
    listSummaries(encounterId),
    listAudit(encounterId),
  ]);
  return { encounter, answers, facts, summaries, audit: auditTrail };
}

/** The latest signed summary for a patient's encounters, newest first. */
export async function listSignedReports(patientId: string) {
  const client = await db();
  const result = await client.execute({
    sql: `SELECT s.*, e.signed_at, e.chief_complaint FROM summaries s
          JOIN encounters e ON e.id = s.encounter_id
          WHERE e.patient_id = ? AND s.status = 'SIGNED'
          ORDER BY s.created_at DESC`,
    args: [patientId],
  });
  return result.rows.map((row) => ({
    ...toSummary(row as Row),
    chiefComplaint: nullable((row as Row)["chief_complaint"]),
  }));
}

export async function findPatientByName(name: string) {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT * FROM patients WHERE lower(name) = lower(?) LIMIT 1",
    args: [name],
  });
  const row = result.rows[0] as Row | undefined;
  return row ? { id: text(row["id"]), name: text(row["name"]), age: num(row["age"]) } : null;
}

export async function searchPatients(query: string) {
  const client = await db();
  const like = `%${query.trim().toLowerCase()}%`;
  const result = await client.execute({
    sql: `${ENCOUNTER_SELECT} WHERE lower(p.name) LIKE ? OR lower(e.id) LIKE ? OR lower(COALESCE(e.chief_complaint,'')) LIKE ?
          ORDER BY e.started_at DESC LIMIT 12`,
    args: [like, like, like],
  });
  return result.rows.map((row) => toEncounter(row as Row));
}

/** One patient record, used by the patient's own portal. */
export async function getPatient(patientId: string): Promise<PatientRow | null> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT * FROM patients WHERE id = ? LIMIT 1",
    args: [patientId],
  });
  const row = result.rows[0] as Row | undefined;
  if (!row) return null;
  return {
    id: text(row["id"]),
    name: text(row["name"]),
    age: num(row["age"]),
    language: text(row["language"]) === "en" ? "en" : "hi",
    phone: nullable(row["phone"]),
  };
}

/** Recent activity across every encounter, for the clinician timeline. */
export async function listRecentAudit(limit = 60) {
  const client = await db();
  const result = await client.execute({
    sql: `SELECT a.id, a.encounter_id, a.patient_id, a.action, a.actor, a.created_at,
                 p.name AS patient_name
          FROM audit_events a
          LEFT JOIN patients p ON p.id = a.patient_id
          ORDER BY a.id DESC LIMIT ?`,
    args: [Math.min(Math.max(limit, 1), 200)],
  });
  return result.rows.map((row) => ({
    id: num((row as Row)["id"]),
    encounterId: nullable((row as Row)["encounter_id"]),
    patientId: nullable((row as Row)["patient_id"]),
    patientName: nullable((row as Row)["patient_name"]),
    action: text((row as Row)["action"]),
    actor: text((row as Row)["actor"]),
    createdAt: text((row as Row)["created_at"]),
  }));
}

/** Confirmed findings across recent encounters, for clinic-wide review. */
export async function listRecentConfirmedFacts(limit = 200) {
  const client = await db();
  const result = await client.execute({
    sql: `SELECT f.*, e.status AS encounter_status, p.name AS patient_name, p.id AS patient_ref
          FROM clinical_facts f
          JOIN encounters e ON e.id = f.encounter_id
          LEFT JOIN patients p ON p.id = e.patient_id
          WHERE f.status = 'confirmed'
          ORDER BY f.created_at DESC LIMIT ?`,
    args: [Math.min(Math.max(limit, 1), 400)],
  });
  return result.rows.map((row) => ({
    ...toFact(row as Row),
    patientName: text((row as Row)["patient_name"]),
    encounterStatus: text((row as Row)["encounter_status"]),
  }));
}
