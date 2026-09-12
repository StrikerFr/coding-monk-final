import {
  KIOSK_TOTAL_STEPS,
  stepNumber,
  type KioskLanguage,
  type KioskStepId,
  type PatientKioskSession,
} from "./session";
import { questionText, questionsIn } from "./questions";
import {
  completeIntake,
  confirmAnswer,
  getClinicalFollowUpQuestions,
  getEncounterAnswers,
  getEncounterSummary,
  getInterviewQuestion,
  saveAnswer as saveAnswerFn,
  savePatientDetails,
  startEncounter,
} from "@/lib/clinical/clinical.functions";
import type { AnswerRow, ClinicalFollowUpQuestion, SummaryRow } from "@/lib/clinical/types";

/**
 * The kiosk's data boundary. Every answer, detail and measurement is written to
 * the patient's real encounter record; only the id of the open check-in is kept
 * in the browser so a reload can resume the same encounter.
 */

const STORAGE_KEY = "medikiosk.encounter";
export const FINISHED_ENCOUNTER_KEY = "medikiosk.finished-encounters";

/** Keeps the ids of finished check-ins so the patient portal can claim them. */
function rememberFinished(encounterId: string) {
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(FINISHED_ENCOUNTER_KEY) ?? "[]",
    ) as unknown;
    const list = Array.isArray(stored) ? stored.map(String) : [];
    if (!list.includes(encounterId)) list.push(encounterId);
    window.localStorage.setItem(FINISHED_ENCOUNTER_KEY, JSON.stringify(list.slice(-10)));
  } catch {
    /* storage unavailable: the visit still exists in the record */
  }
}

let current: PatientKioskSession | null = null;

function rememberEncounter(encounterId: string) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, encounterId);
  } catch {
    /* storage unavailable: the session simply will not resume after a reload */
  }
}

function rememberedEncounter(): string | undefined {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function forgetEncounter() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}

function blankSession(language: KioskLanguage): PatientKioskSession {
  return {
    sessionId: "",
    encounterId: null,
    patientId: null,
    language,
    currentStep: "welcome",
    patientStatus: "unidentified",
    consentStatus: "pending",
    patientType: "unknown",
    profile: {},
    answers: {},
    candidates: {},
    confirmed: [],
    paperTypes: [],
    documents: [],
    vitals: {},
    syncStatus: "local",
    token: null,
    completed: false,
  };
}

export type KioskProgress = {
  currentStep: KioskStepId;
  currentIndex: number;
  totalSteps: number;
};

const PROFILE_IDS = new Set(["name", "age", "gender", "phone"]);
const VITAL_IDS = new Set(questionsIn("vitals").map((question) => question.id));

async function persistAnswer(
  session: PatientKioskSession,
  id: string,
  value: string,
  source: "voice" | "typed",
) {
  if (!session.encounterId || !value.trim()) return null;
  return await saveAnswerFn({
    data: {
      encounterId: session.encounterId,
      questionId: id,
      questionText: questionText(id),
      transcript: value,
      language: session.language,
      source,
    },
  });
}

export const patientKioskApi = {
  /** Opens the check-in: resumes the patient's open encounter or starts one. */
  async startSession(language: KioskLanguage = "hi", forceNew = false): Promise<PatientKioskSession> {
    if (forceNew) {
      forgetEncounter();
    }
    const remembered = forceNew ? undefined : rememberedEncounter();
    const started = await startEncounter({
      data: { language, ...(remembered ? { encounterId: remembered } : {}) },
    });
    rememberEncounter(started.encounterId);

    const stored = await getEncounterAnswers({
      data: { encounterId: started.encounterId },
    });

    const session = blankSession(language);
    session.sessionId = started.encounterId;
    session.encounterId = started.encounterId;
    session.patientId = started.patientId;
    session.syncStatus = "synced";
    session.token = started.encounterId.slice(-6);

    for (const answer of stored) {
      if (PROFILE_IDS.has(answer.questionId))
        session.profile[answer.questionId] = answer.transcript;
      else if (VITAL_IDS.has(answer.questionId))
        session.vitals[answer.questionId] = answer.transcript;
      else if (answer.questionId === "paperTypes") {
        try {
          session.paperTypes = JSON.parse(answer.transcript);
        } catch {
          session.paperTypes = [];
        }
      } else session.answers[answer.questionId] = answer.transcript;
      if (answer.status === "confirmed") session.confirmed.push(answer.questionId);
    }

    current = session;
    return session;
  },

  /** Every answer stored for this check-in, with the question that was asked. */
  async listStoredAnswers(): Promise<AnswerRow[]> {
    const session = current;
    if (!session?.encounterId) return [];
    return getEncounterAnswers({ data: { encounterId: session.encounterId } });
  },

  async getSession(): Promise<PatientKioskSession | null> {
    return current;
  },

  async getClinicalFollowUps(
    openingAnswers?: Record<string, string>,
    selectedLanguage?: KioskLanguage,
  ): Promise<ClinicalFollowUpQuestion[]> {
    const session = current ?? (await this.startSession("hi"));
    const statementIds = ["story", "pattern", "anythingElse"];
    const statements = statementIds.flatMap((id) => {
      const answer = (openingAnswers?.[id] ?? session.answers[id])?.trim();
      return answer ? [{ question: questionText(id), answer }] : [];
    });
    return getClinicalFollowUpQuestions({
      data: { language: selectedLanguage ?? session.language, statements },
    });
  },

  /** The next question of the free-flowing spoken interview. */
  async getInterviewQuestion(
    turns: Array<{ question: string; answer: string }>,
  ): Promise<{ done: boolean; field: "name" | "age" | "clinical"; question: string }> {
    const session = current ?? (await this.startSession("hi"));
    return getInterviewQuestion({
      data: {
        language: session.language,
        known: {
          ...(session.profile["name"] ? { name: session.profile["name"] } : {}),
          ...(session.profile["age"] ? { age: session.profile["age"] } : {}),
        },
        turns,
      },
    });
  },

  /** The assisted summary prepared for this check-in, once it is finished. */
  async getSummary(): Promise<SummaryRow | null> {
    const session = current;
    if (!session?.encounterId) return null;
    return getEncounterSummary({ data: { encounterId: session.encounterId } });
  },

  async updateLanguage(language: KioskLanguage): Promise<PatientKioskSession> {
    current = { ...(current ?? blankSession(language)), language };
    return current;
  },

  async setStep(step: KioskStepId): Promise<PatientKioskSession> {
    current = { ...(current ?? blankSession("hi")), currentStep: step };
    return current;
  },

  /**
   * Saves one answer to the record and returns the candidate information the
   * assisted reader found in it. Throws when nothing could be saved.
   */
  async saveAnswer(
    id: string,
    value: string,
    source: "voice" | "typed" = "voice",
    suppliedQuestionText?: string,
  ): Promise<PatientKioskSession> {
    const session = current ?? (await this.startSession("hi"));
    const result = session.encounterId
      ? await saveAnswerFn({
          data: {
            encounterId: session.encounterId,
            questionId: id,
            questionText: suppliedQuestionText ?? questionText(id),
            transcript: value,
            language: session.language,
            source,
          },
        })
      : null;
    const target = PROFILE_IDS.has(id) ? "profile" : VITAL_IDS.has(id) ? "vitals" : "answers";

    current = {
      ...session,
      [target]: { ...session[target], [id]: value },
      candidates: {
        ...session.candidates,
        ...(result ? { [id]: result.candidates.map((fact) => fact.displayValue) } : {}),
      },
      confirmed: session.confirmed.filter((entry) => entry !== id),
      syncStatus: result ? "synced" : "local",
      lastError: result?.aiError ?? null,
    };
    return current;
  },

  /** Saves several answers at once (used by the multi-card steps). */
  async saveAnswers(answers: Record<string, string>): Promise<PatientKioskSession> {
    const session = current ?? (await this.startSession("hi"));
    for (const [id, value] of Object.entries(answers)) {
      const existing = session.answers[id] ?? session.profile[id] ?? session.vitals[id];
      if (value && value !== existing) await this.saveAnswer(id, value, "voice");
    }
    return current ?? session;
  },

  /** The patient agreed with the read-back for one question. */
  async confirmAnswer(id: string): Promise<PatientKioskSession> {
    const session = current ?? (await this.startSession("hi"));
    if (!session.encounterId) return session;
    await confirmAnswer({ data: { encounterId: session.encounterId, questionId: id } });
    current = {
      ...session,
      confirmed: session.confirmed.includes(id) ? session.confirmed : [...session.confirmed, id],
    };
    return current;
  },

  /** Merges what the patient entered on this screen into the session. */
  async patchSession(patch: Partial<PatientKioskSession>): Promise<PatientKioskSession> {
    const session = current ?? blankSession("hi");
    const cleanVitals = { ...(session.vitals ?? {}) };
    if (patch.vitals) {
      for (const [k, v] of Object.entries(patch.vitals)) {
        if (v && v.trim()) {
          cleanVitals[k] = v.trim();
        }
      }
    }
    const cleanProfile = { ...(session.profile ?? {}) };
    if (patch.profile) {
      for (const [k, v] of Object.entries(patch.profile)) {
        if (v && v.trim()) {
          cleanProfile[k] = v.trim();
        }
      }
    }
    current = {
      ...session,
      ...patch,
      profile: cleanProfile,
      answers: { ...session.answers, ...(patch.answers ?? {}) },
      vitals: cleanVitals,
    };
    return current;
  },

  /**
   * Stores everything collected so far: the patient's details, the measurements
   * and their agreement with what was read back to them.
   */
  async saveSession(): Promise<PatientKioskSession> {
    const session = current ?? (await this.startSession("hi"));
    if (!session.encounterId) throw new Error("This check-in could not be opened");

    const age = Number(session.profile["age"] ?? 0);
    await savePatientDetails({
      data: {
        encounterId: session.encounterId,
        language: session.language,
        ...(session.profile["name"] ? { name: session.profile["name"] } : {}),
        ...(Number.isFinite(age) && age > 0 ? { age } : {}),
        ...(session.profile["phone"] ? { phone: session.profile["phone"] } : {}),
      },
    });

    for (const [id, value] of Object.entries(session.vitals)) {
      if (value && value.trim()) await persistAnswer(session, id, value.trim(), "typed");
    }
    if (session.paperTypes && session.paperTypes.length > 0) {
      await persistAnswer(session, "paperTypes", JSON.stringify(session.paperTypes), "typed");
    }
    for (const [id, value] of Object.entries(session.answers)) {
      if (value)
        await confirmAnswer({ data: { encounterId: session.encounterId, questionId: id } });
    }

    current = { ...session, syncStatus: "synced", token: session.encounterId.slice(-6) };
    return current;
  },

  /**
   * Finishes the check-in. The stored answers are read back out of the record,
   * the assisted draft is prepared and the case joins the clinician worklist.
   */
  async completeSession(): Promise<PatientKioskSession> {
    const session = current ?? (await this.startSession("hi"));
    if (!session.encounterId) throw new Error("This check-in could not be opened");
    const result = await completeIntake({ data: { encounterId: session.encounterId } });
    rememberFinished(session.encounterId);
    forgetEncounter();
    current = {
      ...session,
      completed: true,
      currentStep: "complete",
      syncStatus: "synced",
      lastError: result.aiError ?? null,
    };
    return current;
  },

  async getProgress(): Promise<KioskProgress> {
    const step = current?.currentStep ?? "welcome";
    return {
      currentStep: step,
      currentIndex: stepNumber(step),
      totalSteps: KIOSK_TOTAL_STEPS,
    };
  },
};
