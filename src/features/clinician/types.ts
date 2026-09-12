/**
 * Clinician workspace domain types.
 *
 * FRONTEND ONLY. These shapes are deliberately written as if they came from the
 * future MediKiosk backend (Clinical Platform, Clinical NLP, Rules Service,
 * Document Processing, Summary Worker) so the UI never has to change when the
 * real API is wired in behind `clinicianApi`.
 */

export type Priority = "urgent" | "priority" | "normal";

export type CaseStatus = "waiting" | "ready" | "in-progress" | "completed";

export type PatientLanguage = "Hindi" | "English";

export type ReviewState = "needs-review" | "reviewed" | "confirmed" | "updated";

/** Where a piece of information came from. Never blur these together in the UI. */
export type Provenance = "patient-response" | "uploaded-document" | "previous-record" | "ai-draft";

export interface Clinician {
  id: string;
  name: string;
  role: string;
  department: string;
  availability: "available" | "busy" | "away";
}

export interface WorklistPatient {
  id: string;
  caseId: string;
  name: string;
  age: number;
  language: PatientLanguage;
  chiefConcern: string;
  waitingMinutes: number;
  status: CaseStatus;
  priority: Priority;
  alertCount: number;
}

export interface ConfirmedFact {
  id: string;
  label: string;
  value: string;
  patientWords?: string;
  confirmedAt: string;
}

export interface EvidenceItem {
  id: string;
  provenance: Exclude<Provenance, "ai-draft">;
  title: string;
  detail: string;
  capturedAt: string;
  reference?: string;
}

export interface DraftSummary {
  id: string;
  body: string;
  generatedAt: string;
  reviewState: ReviewState;
  sourceCount: number;
}

export interface CaseDocument {
  id: string;
  name: string;
  kind: string;
  uploadedAt: string;
  processingStatus: "processing" | "reviewed" | "needs-review";
  pages: number;
}

export interface CaseAlert {
  id: string;
  title: string;
  explanation: string;
  sources: string[];
  reviewState: ReviewState;
  severity: "attention" | "information";
}

export interface PatientCase {
  patient: WorklistPatient;
  duration: string;
  reportedSymptoms: string[];
  knownMedications: string[];
  allergies: string[];
  confirmedFacts: ConfirmedFact[];
  evidence: EvidenceItem[];
  draftSummary: DraftSummary;
  documents: CaseDocument[];
  alerts: CaseAlert[];
}

export interface ClinicianNotification {
  id: string;
  title: string;
  detail: string;
  receivedAt: string;
  unread: boolean;
}

export interface DashboardMetrics {
  waiting: number;
  priority: number;
  urgent: number;
  ready: number;
  completedToday: number;
}

export interface WorklistFilters {
  query: string;
  priority: Priority | "all";
  status: CaseStatus | "all";
  language: PatientLanguage | "all";
}

export type WorklistSort = "waiting-desc" | "waiting-asc" | "priority" | "name";

export interface SearchResult {
  id: string;
  kind: "patient" | "case" | "document";
  title: string;
  subtitle: string;
  patientId: string;
}
