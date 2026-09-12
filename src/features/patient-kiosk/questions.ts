import type { KioskTranslationKey } from "./translations/en";

/**
 * The one authoritative list of check-in questions. Screens render them; the
 * clinical record stores answers against these same ids, so a question asked at
 * the kiosk is the question the clinician sees as evidence.
 */

export interface KioskQuestion {
  id: string;
  /** Patient-facing text, shown by the kiosk in Hindi and English. */
  key: KioskTranslationKey;
  /** Stable English wording stored with the answer. */
  text: string;
  section: "identification" | "case" | "questions" | "vitals" | "documents";
}

export const KIOSK_QUESTIONS: readonly KioskQuestion[] = [
  {
    id: "name",
    key: "kiosk.id.nameQuestion",
    text: "What is your name?",
    section: "identification",
  },
  { id: "age", key: "kiosk.id.age", text: "How old are you?", section: "identification" },
  {
    id: "phone",
    key: "kiosk.id.phone",
    text: "What is your phone number?",
    section: "identification",
  },
  { id: "story", key: "kiosk.case.q1", text: "What is troubling you right now?", section: "case" },
  {
    id: "pattern",
    key: "kiosk.case.q2",
    text: "When does it feel worse or better?",
    section: "case",
  },
  {
    id: "anythingElse",
    key: "kiosk.case.q3",
    text: "Is there anything else you would like the doctor to know?",
    section: "case",
  },
  {
    id: "concern",
    key: "kiosk.questions.q1",
    text: "What is your main concern today?",
    section: "questions",
  },
  {
    id: "duration",
    key: "kiosk.questions.q2",
    text: "Since when have you had this?",
    section: "questions",
  },
  {
    id: "medicines",
    key: "kiosk.questions.q3",
    text: "Are you taking any medicines at the moment?",
    section: "questions",
  },
  { id: "height", key: "kiosk.vitals.height", text: "Height", section: "vitals" },
  { id: "weight", key: "kiosk.vitals.weight", text: "Weight", section: "vitals" },
  { id: "pulse", key: "kiosk.vitals.pulse", text: "Pulse", section: "vitals" },
  { id: "temperature", key: "kiosk.vitals.temperature", text: "Temperature", section: "vitals" },
] as const;

const byId = new Map(KIOSK_QUESTIONS.map((question) => [question.id, question]));

export function questionText(id: string): string {
  return byId.get(id)?.text ?? id;
}

export function questionsIn(section: KioskQuestion["section"]) {
  return KIOSK_QUESTIONS.filter((question) => question.section === section);
}
