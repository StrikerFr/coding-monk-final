export type PatientLanguage = "en" | "hi";
export type PatientConnection = "online" | "offline" | "unsynced";
export type PatientRecordKind = "consultation" | "report" | "document" | "intake";

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  language: "Hindi" | "English";
}

export interface PatientConsultation {
  id: string;
  clinic: string;
  date: string;
  shortDate: string;
  concern: string;
  status: "completed";
}

export interface PatientRecord {
  id: string;
  kind: PatientRecordKind;
  title: string;
  date: string;
  status: string;
  description: string;
  sections?: Array<{ heading: string; content: string }>;
}

export interface PatientDocument {
  id: string;
  title: string;
  type: "Report" | "Prescription";
  date: string;
  status: "available";
}

export interface PatientTimelineEvent {
  id: string;
  date: string;
  title: string;
  detail: string;
  kind: PatientRecordKind | "review" | "consent";
}

export interface PatientNotification {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}

export interface PatientIntake {
  id: string;
  title: string;
  date: string;
  status: "Completed";
}

export interface PatientConsent {
  lastReviewed: string;
  status: "review-available";
}

export interface PatientDashboard {
  latestConsultation: PatientConsultation;
  recentRecords: PatientRecord[];
  documents: PatientDocument[];
  timeline: PatientTimelineEvent[];
  notifications: PatientNotification[];
  intakes: PatientIntake[];
  consent: PatientConsent;
  lastUpdated: string;
}

export interface PatientSearchResult {
  id: string;
  title: string;
  subtitle: string;
  kind: PatientRecordKind;
  to: "/patient/timeline" | "/patient/reports" | "/patient/documents" | "/patient/intakes";
}
