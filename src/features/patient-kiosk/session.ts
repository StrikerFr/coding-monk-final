/**
 * Frontend-only session model for the Patient Kiosk.
 *
 * This mirrors the shape the backend will eventually return. No clinical logic
 * lives here — it only describes what the kiosk is currently showing.
 */

export type KioskLanguage = "hi" | "en";

export type KioskStepId =
  | "welcome"
  | "consent"
  | "identification"
  | "introduction"
  | "case-taking"
  | "confirm"
  | "questions"
  | "vitals"
  | "documents"
  | "processing"
  | "review"
  | "complete";

export type KioskSyncStatus = "local" | "synced";

export type PatientKioskSession = {
  sessionId: string;
  /** The stored visit this check-in belongs to. */
  encounterId: string | null;
  /** The stored patient record this visit belongs to. */
  patientId: string | null;
  language: KioskLanguage;
  currentStep: KioskStepId;
  patientStatus: "unidentified" | "identified";
  consentStatus: "pending" | "granted" | "declined";
  patientType: "new" | "returning" | "unknown";
  /** What the patient told us about themselves (name, age, gender, phone). */
  profile: Record<string, string>;
  answers: Record<string, string>;
  /** What the assisted reader understood from each answer, for read-back. */
  candidates: Record<string, string[]>;
  /** Question ids the patient has agreed with. */
  confirmed: string[];
  /** Papers the patient says they have with them. */
  paperTypes: string[];
  documents: Array<{ id: string; label: string; status: "pending" | "uploaded" }>;
  vitals: Record<string, string>;
  syncStatus: KioskSyncStatus;
  /** Short code shown to the patient at the end of check-in. */
  token: string | null;
  completed: boolean;
  /** Set when assisted reading was unavailable. The answer itself is safe. */
  lastError?: string | null;
};

export type KioskStep = {
  id: KioskStepId;
  /** Route path this step lives at. */
  path: string;
  /** Translation key for the patient-facing label. */
  labelKey:
    | "kiosk.step.welcome"
    | "kiosk.step.consent"
    | "kiosk.step.identification"
    | "kiosk.step.introduction"
    | "kiosk.step.caseTaking"
    | "kiosk.step.confirm"
    | "kiosk.step.questions"
    | "kiosk.step.vitals"
    | "kiosk.step.documents"
    | "kiosk.step.processing"
    | "kiosk.step.review"
    | "kiosk.step.complete";
};

/** The full patient journey, data-driven so screens can be added later. */
export const KIOSK_STEPS: readonly KioskStep[] = [
  { id: "welcome", path: "/patient-kiosk", labelKey: "kiosk.step.welcome" },
  { id: "consent", path: "/patient-kiosk/consent", labelKey: "kiosk.step.consent" },
  {
    id: "identification",
    path: "/patient-kiosk/identification",
    labelKey: "kiosk.step.identification",
  },
  { id: "introduction", path: "/patient-kiosk/introduction", labelKey: "kiosk.step.introduction" },
  { id: "case-taking", path: "/patient-kiosk/case-taking", labelKey: "kiosk.step.caseTaking" },
  { id: "confirm", path: "/patient-kiosk/confirm", labelKey: "kiosk.step.confirm" },
  { id: "questions", path: "/patient-kiosk/questions", labelKey: "kiosk.step.questions" },
  { id: "vitals", path: "/patient-kiosk/vitals", labelKey: "kiosk.step.vitals" },
  { id: "documents", path: "/patient-kiosk/documents", labelKey: "kiosk.step.documents" },
  { id: "processing", path: "/patient-kiosk/processing", labelKey: "kiosk.step.processing" },
  { id: "review", path: "/patient-kiosk/review", labelKey: "kiosk.step.review" },
  { id: "complete", path: "/patient-kiosk/complete", labelKey: "kiosk.step.complete" },
] as const;

export function stepNumber(id: KioskStepId): number {
  return KIOSK_STEPS.findIndex((s) => s.id === id) + 1;
}

export const KIOSK_TOTAL_STEPS = KIOSK_STEPS.length;

/** The step that follows `id`, or null at the end of the journey. */
export function nextStep(id: KioskStepId): KioskStep | null {
  const index = KIOSK_STEPS.findIndex((s) => s.id === id);
  return KIOSK_STEPS[index + 1] ?? null;
}

/** The step before `id`, or null at the start of the journey. */
export function previousStep(id: KioskStepId): KioskStep | null {
  const index = KIOSK_STEPS.findIndex((s) => s.id === id);
  return index > 0 ? (KIOSK_STEPS[index - 1] ?? null) : null;
}
