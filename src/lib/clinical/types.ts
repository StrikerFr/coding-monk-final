/**
 * Shared clinical record shapes. Client-safe: these describe rows that live in
 * Turso and are returned by the clinical server functions.
 */

export type EncounterStatus = "in-progress" | "ready-for-review" | "completed";
export type AnswerStatus = "captured" | "confirmed" | "corrected";
export type FactStatus = "candidate" | "confirmed" | "discarded";
export type SummaryStatus = "AI_DRAFT" | "CLINICIAN_EDITED" | "SIGNED";

export interface PatientRow {
  id: string;
  name: string;
  age: number;
  language: "hi" | "en";
  phone: string | null;
}

export interface EncounterRow {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  language: "hi" | "en";
  status: EncounterStatus;
  chiefComplaint: string | null;
  startedAt: string;
  completedAt: string | null;
  signedAt: string | null;
  answerCount: number;
  confirmedFactCount: number;
}

export interface AnswerRow {
  id: string;
  encounterId: string;
  questionId: string;
  questionText: string;
  transcript: string;
  language: "hi" | "en";
  source: "voice" | "typed";
  status: AnswerStatus;
  createdAt: string;
}

export interface FactRow {
  id: string;
  encounterId: string;
  answerId: string | null;
  category: string;
  field: string;
  value: string;
  displayValue: string;
  certainty: "CLEAR" | "IMPLIED" | "UNCERTAIN";
  sourceText: string;
  status: FactStatus;
  createdAt: string;
}

export interface SummarySection {
  heading: string;
  content: string;
}

export interface SummaryBody {
  sections: SummarySection[];
  itemsRequiringReview: string[];
}

export interface SummaryRow {
  id: string;
  encounterId: string;
  version: number;
  status: SummaryStatus;
  author: string;
  body: SummaryBody;
  sourceFactIds: string[];
  createdAt: string;
}

export interface AuditRow {
  id: number;
  encounterId: string | null;
  patientId: string | null;
  action: string;
  actor: string;
  createdAt: string;
}

export interface EncounterDetail {
  encounter: EncounterRow;
  answers: AnswerRow[];
  facts: FactRow[];
  summaries: SummaryRow[];
  audit: AuditRow[];
}

/** Structured candidate information Gemini extracted from one answer. */
export interface ExtractionResult {
  facts: Array<{
    category: string;
    field: string;
    value: string;
    displayValue: string;
    certainty: "CLEAR" | "IMPLIED" | "UNCERTAIN";
    sourceText: string;
  }>;
  needsClarification: boolean;
  clarificationQuestion: string | null;
}

/** A focused, non-diagnostic question prepared from the patient's own account. */
export interface ClinicalFollowUpQuestion {
  id: string;
  text: string;
}
