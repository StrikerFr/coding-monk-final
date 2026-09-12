export type AssistedQueueStatus = "waiting" | "in-progress" | "ready" | "completed";
export type AssistedQueueFilter = "all" | AssistedQueueStatus;
export type AssistanceState = "Required" | "In progress" | "Complete";
export type CaptureState = "Not recorded" | "Recorded";
export type HandoffState = "Not ready" | "Ready for clinician handoff" | "Completed";

export interface StaffSession {
  staffName: string;
  role: string;
  availability: "Available" | "Busy";
  connection: "Connected" | "Connection unavailable";
}

export interface AssistedPatient {
  id: string;
  name: string;
  age: number;
  language: "Hindi" | "English";
  arrivalTime: string;
  waitMinutes: number;
  status: AssistedQueueStatus;
  assistance: AssistanceState;
  intakeProgress: { step: number; total: number; label: string; startedAt?: string };
  vitalsStatus: CaptureState;
  documentCount: number;
  handoffStatus: HandoffState;
  completedAt?: string;
}

export interface QueueState {
  patients: AssistedPatient[];
  selectedPatientId: string | null;
  filter: AssistedQueueFilter;
  search: string;
}
