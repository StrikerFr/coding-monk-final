import type {
  CaseAlert,
  CaseDocument,
  Clinician,
  ClinicianNotification,
  DashboardMetrics,
  DraftSummary,
  PatientCase,
  SearchResult,
  WorklistPatient,
} from "./types";
import { getDocument, listCollection } from "@/lib/store.functions";
import { listEncounterDocuments } from "@/lib/clinical/documents.functions";
import type { DocumentType } from "@/lib/clinical/documents.types";

const DOCUMENT_KIND: Record<DocumentType, string> = {
  prescription: "Prescription",
  lab_report: "Lab report",
  medical_report: "Medical report",
  discharge_summary: "Discharge summary",
  previous_consultation: "Previous consultation",
  other: "Document",
};
import { getEncounter, listEncounters, searchEncounters } from "@/lib/clinical/clinical.functions";
import type { AnswerRow, EncounterDetail, EncounterRow, FactRow } from "@/lib/clinical/types";

/**
 * Data boundary for the clinician workspace. Worklist, cases, confirmed
 * information, evidence and assisted drafts all come from the stored encounter
 * records — the same rows the patient kiosk writes.
 */

const listOf = async <T>(collection: string): Promise<T[]> =>
  (await listCollection({ data: { collection } })) as unknown as T[];

const docOf = async <T>(collection: string, id: string): Promise<T | null> =>
  (await getDocument({ data: { collection, id } })) as unknown as T | null;

interface PatientOwnedList<T> {
  patientId: string;
  items: T[];
}

const minutesSince = (iso: string) => {
  const started = Date.parse(iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`);
  if (Number.isNaN(started)) return 0;
  return Math.max(0, Math.round((Date.now() - started) / 60000));
};

const when = (iso: string) => {
  const parsed = new Date(iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(parsed);
};

const statusOf = (encounter: EncounterRow): WorklistPatient["status"] =>
  encounter.status === "completed"
    ? "completed"
    : encounter.status === "ready-for-review"
      ? "ready"
      : "in-progress";

/** Deterministic, wait-time based prioritisation. No AI decides urgency. */
function priorityOf(encounter: EncounterRow, waiting: number): WorklistPatient["priority"] {
  if (encounter.status === "completed") return "normal";
  if (waiting >= 45) return "urgent";
  if (waiting >= 20) return "priority";
  return "normal";
}

/** Deterministic safety flags read from confirmed information only. */
const ATTENTION_TERMS = [
  "chest pain",
  "breathless",
  "shortness of breath",
  "bleeding",
  "fainting",
  "unconscious",
  "severe pain",
];

function alertsFrom(facts: FactRow[]): CaseAlert[] {
  return unique(
    facts.filter((fact) => fact.status === "confirmed"),
    (fact) => `${fact.category}|${fact.displayValue}`,
  ).flatMap((fact) => {
    const match = ATTENTION_TERMS.find((term) =>
      `${fact.value} ${fact.displayValue}`.toLowerCase().includes(term),
    );
    if (!match) return [];
    return [
      {
        id: `${fact.id}-alert`,
        title: `Patient reported ${fact.displayValue}`,
        explanation:
          "Flagged by a fixed check-in rule because the patient reported this themselves. Clinical judgement is required.",
        sources: [fact.sourceText || fact.displayValue],
        reviewState: "needs-review" as const,
        severity: "attention" as const,
      },
    ];
  });
}

function toWorklistPatient(encounter: EncounterRow, alertCount = 0): WorklistPatient {
  const waiting = minutesSince(encounter.startedAt);
  return {
    id: encounter.id,
    caseId: encounter.id,
    name: encounter.patientName,
    age: encounter.age,
    language: encounter.language === "en" ? "English" : "Hindi",
    chiefConcern: encounter.chiefComplaint ?? "Check-in in progress",
    waitingMinutes: encounter.status === "completed" ? 0 : waiting,
    status: statusOf(encounter),
    priority: priorityOf(encounter, waiting),
    alertCount,
  };
}

function evidenceFrom(answers: AnswerRow[]): PatientCase["evidence"] {
  return answers.map((answer) => ({
    id: answer.id,
    provenance: "patient-response" as const,
    title: answer.questionText,
    detail: answer.transcript,
    capturedAt: when(answer.createdAt),
    reference: answer.source === "typed" ? "Typed at the kiosk" : "Spoken at the kiosk",
  }));
}

function draftFrom(detail: EncounterDetail): DraftSummary {
  const latest = detail.summaries.at(-1);
  if (!latest) {
    return {
      id: `${detail.encounter.id}-no-draft`,
      body: "No assisted draft has been prepared for this encounter yet.",
      generatedAt: when(detail.encounter.startedAt),
      reviewState: "needs-review",
      sourceCount: 0,
    };
  }
  const body = latest.body.sections
    .map((section) => `${section.heading}: ${section.content}`)
    .join("\n\n");
  return {
    id: latest.id,
    body,
    generatedAt: when(latest.createdAt),
    reviewState:
      latest.status === "SIGNED"
        ? "confirmed"
        : latest.status === "CLINICIAN_EDITED"
          ? "updated"
          : "needs-review",
    sourceCount: latest.sourceFactIds.length,
  };
}

/** Keeps the first of each repeated entry, ignoring case and spacing. */
function unique<T>(items: T[], keyOf: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyOf(item).trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const categoryValues = (facts: FactRow[], category: string) =>
  unique(
    facts.filter((fact) => fact.category === category).map((fact) => fact.displayValue),
    (value) => value,
  );

export const clinicianApi = {
  async getSession(): Promise<Clinician> {
    const session = await docOf<Clinician>("clinician_session", "default");
    if (!session) throw new Error("Clinician profile is unavailable");
    return session;
  },

  async getWorklist(): Promise<WorklistPatient[]> {
    const encounters = await listEncounters();
    return encounters.map((encounter) => toWorklistPatient(encounter));
  },

  async getMetrics(): Promise<DashboardMetrics> {
    const list = await this.getWorklist();
    return {
      waiting: list.filter((p) => p.status === "waiting" || p.status === "ready").length,
      priority: list.filter((p) => p.priority === "priority").length,
      urgent: list.filter((p) => p.priority === "urgent").length,
      ready: list.filter((p) => p.status === "ready").length,
      completedToday: list.filter((p) => p.status === "completed").length,
    };
  },

  /** One encounter, assembled for the clinical workspace. */
  async getPatientCase(id: string): Promise<PatientCase | null> {
    let detail: EncounterDetail;
    try {
      detail = await getEncounter({ data: { encounterId: id } });
    } catch {
      return null;
    }
    const confirmed = detail.facts.filter((fact) => fact.status === "confirmed");
    const alerts = alertsFrom(detail.facts);
    const documents = await this.getEncounterDocuments(detail.encounter.id);

    return {
      patient: toWorklistPatient(detail.encounter, alerts.length),
      duration: categoryValues(confirmed, "DURATION")[0] ?? "Not provided",
      reportedSymptoms:
        categoryValues(confirmed, "SYMPTOM").length > 0
          ? categoryValues(confirmed, "SYMPTOM")
          : ["Not provided"],
      knownMedications:
        categoryValues(confirmed, "MEDICATION").length > 0
          ? categoryValues(confirmed, "MEDICATION")
          : ["None reported"],
      allergies:
        categoryValues(confirmed, "ALLERGY").length > 0
          ? categoryValues(confirmed, "ALLERGY")
          : ["None reported"],
      confirmedFacts: unique(
        confirmed,
        (fact) => `${fact.category}|${fact.field}|${fact.displayValue}`,
      ).map((fact) => ({
        id: fact.id,
        label: fact.field,
        value: fact.displayValue,
        ...(fact.sourceText ? { patientWords: fact.sourceText } : {}),
        confirmedAt: when(fact.createdAt),
      })),
      evidence: evidenceFrom(detail.answers),
      draftSummary: draftFrom(detail),
      documents,
      alerts,
    };
  },

  /** Documents the patient actually attached to this check-in. */
  async getEncounterDocuments(encounterId: string): Promise<CaseDocument[]> {
    const rows = await listEncounterDocuments({ data: { encounterId } });
    return rows.map((row) => ({
      id: row.id,
      name: row.fileName,
      kind: DOCUMENT_KIND[row.documentType] ?? "Document",
      uploadedAt: when(row.createdAt),
      processingStatus:
        row.status === "REVIEWED"
          ? "reviewed"
          : row.status === "READY_FOR_REVIEW" || row.status === "FAILED"
            ? "needs-review"
            : "processing",
      pages: 1,
    }));
  },

  async getPatientAlerts(id: string): Promise<CaseAlert[]> {
    const patientCase = await this.getPatientCase(id);
    return patientCase?.alerts ?? [];
  },

  async getSummary(id: string): Promise<DraftSummary | null> {
    const patientCase = await this.getPatientCase(id);
    return patientCase?.draftSummary ?? null;
  },

  async getNotifications(): Promise<ClinicianNotification[]> {
    return await listOf<ClinicianNotification>("clinician_notifications");
  },

  /** Searches the stored encounters, not an in-memory list. */
  async search(query: string): Promise<SearchResult[]> {
    const q = query.trim();
    if (!q) return [];
    const encounters = await searchEncounters({ data: { query: q } });
    return encounters.flatMap((encounter) => {
      const patient = toWorklistPatient(encounter);
      return [
        {
          id: `patient-${encounter.id}`,
          kind: "patient" as const,
          title: patient.name,
          subtitle: `${patient.age} years · ${patient.chiefConcern}`,
          patientId: encounter.id,
        },
        {
          id: `case-${encounter.id}`,
          kind: "case" as const,
          title: `Case ${encounter.id}`,
          subtitle: `${patient.name} · ${patient.language}`,
          patientId: encounter.id,
        },
      ];
    });
  },
};
