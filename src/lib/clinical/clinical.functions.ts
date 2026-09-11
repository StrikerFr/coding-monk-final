import { createServerFn } from "@tanstack/react-start";
import type {
  AnswerRow,
  ClinicalFollowUpQuestion,
  EncounterDetail,
  EncounterRow,
  FactRow,
  SummaryBody,
  SummaryRow,
} from "./types";

/**
 * Typed RPC boundary for the clinical record. Every screen — kiosk, clinician,
 * patient — goes through these calls, so all of them read the same rows.
 */

const str = (value: unknown, field: string) => {
  if (typeof value !== "string" || value.trim().length === 0)
    throw new Error(`${field} is required`);
  return value.trim();
};

const lang = (value: unknown): "hi" | "en" => (value === "en" ? "en" : "hi");

async function core() {
  const [service, seed] = await Promise.all([import("./clinical.server"), import("./seed.server")]);
  await seed.ensureSeed();
  return service;
}

/** Starts, or resumes, the check-in for this patient. */
export const startEncounter = createServerFn({ method: "POST" })
  .validator(
    (input: {
      language?: string;
      name?: string;
      age?: number;
      phone?: string;
      encounterId?: string;
    }) => ({
      language: lang(input?.language),
      ...(input?.name ? { name: input.name.slice(0, 120) } : {}),
      ...(typeof input?.age === "number" ? { age: input.age } : {}),
      ...(input?.phone ? { phone: input.phone.slice(0, 20) } : {}),
      ...(input?.encounterId ? { encounterId: input.encounterId } : {}),
    }),
  )
  .handler(async ({ data }) => (await core()).startEncounter(data));

/** Saves the patient's own details onto their record. */
export const savePatientDetails = createServerFn({ method: "POST" })
  .validator(
    (input: {
      encounterId: string;
      name?: string;
      age?: number;
      phone?: string;
      language?: string;
    }) => ({
      encounterId: str(input?.encounterId, "The check-in"),
      ...(input?.name ? { name: input.name.slice(0, 120) } : {}),
      ...(typeof input?.age === "number" && input.age > 0 ? { age: input.age } : {}),
      ...(input?.phone ? { phone: input.phone.slice(0, 20) } : {}),
      language: lang(input?.language),
    }),
  )
  .handler(async ({ data }) => {
    const { encounterId, ...details } = data;
    const patientId = await (await core()).updatePatientDetails(encounterId, details);
    return { patientId };
  });

/** Stores one answer and asks for candidate structured information. */
export const saveAnswer = createServerFn({ method: "POST" })
  .validator(
    (input: {
      encounterId: string;
      questionId: string;
      questionText: string;
      transcript: string;
      language?: string;
      source?: string;
    }) => ({
      encounterId: str(input?.encounterId, "The check-in"),
      questionId: str(input?.questionId, "A question"),
      questionText: str(input?.questionText, "The question text"),
      transcript: str(input?.transcript, "An answer").slice(0, 2000),
      language: lang(input?.language),
      source: (input?.source === "typed" ? "typed" : "voice") as "typed" | "voice",
    }),
  )
  .handler(async ({ data }) => (await core()).saveAnswer(data));

/** The patient agreed with the read-back. */
export const confirmAnswer = createServerFn({ method: "POST" })
  .validator((input: { encounterId: string; questionId: string }) => ({
    encounterId: str(input?.encounterId, "The check-in"),
    questionId: str(input?.questionId, "A question"),
  }))
  .handler(async ({ data }) => (await core()).confirmAnswer(data));

/** Finishes the check-in and prepares the assisted draft for the clinician. */
export const completeIntake = createServerFn({ method: "POST" })
  .validator((input: { encounterId: string }) => ({
    encounterId: str(input?.encounterId, "The check-in"),
  }))
  .handler(async ({ data }) => (await core()).completeIntake(data));

/** Everything recorded during one check-in. */
export const getEncounter = createServerFn({ method: "GET" })
  .validator((input: { encounterId: string }) => ({
    encounterId: str(input?.encounterId, "The check-in"),
  }))
  .handler(async ({ data }): Promise<EncounterDetail> =>
    (await core()).getEncounterDetail(data.encounterId),
  );

/** Answers recorded so far — used to restore the kiosk after a reload. */
export const getEncounterAnswers = createServerFn({ method: "GET" })
  .validator((input: { encounterId: string }) => ({
    encounterId: str(input?.encounterId, "The check-in"),
  }))
  .handler(async ({ data }): Promise<AnswerRow[]> => (await core()).listAnswers(data.encounterId));

/** Prepares only the follow-up questions relevant to the patient's opening account. */
export const getClinicalFollowUpQuestions = createServerFn({ method: "POST" })
  .validator(
    (input: { language?: string; statements: Array<{ question: string; answer: string }> }) => ({
      language: lang(input?.language),
      statements: Array.isArray(input?.statements)
        ? input.statements
            .filter(
              (item) =>
                item && typeof item.question === "string" && typeof item.answer === "string",
            )
            .map((item) => ({
              question: item.question.slice(0, 300),
              answer: item.answer.trim().slice(0, 2000),
            }))
            .filter((item) => item.answer.length > 0)
            .slice(0, 12)
        : [],
    }),
  )
  .handler(async ({ data }): Promise<ClinicalFollowUpQuestion[]> => {
    if (data.statements.length === 0) throw new Error("The patient's concern is required");
    const { generateClinicalFollowUps } = await import("./gemini.server");
    return generateClinicalFollowUps(data);
  });

/** The next question in the free-flowing spoken check-in interview. */
export const getInterviewQuestion = createServerFn({ method: "POST" })
  .validator(
    (input: {
      language?: string;
      known?: { name?: string; age?: string };
      turns?: Array<{ question: string; answer: string }>;
    }) => ({
      language: lang(input?.language),
      known: {
        ...(input?.known?.name ? { name: String(input.known.name).slice(0, 120) } : {}),
        ...(input?.known?.age ? { age: String(input.known.age).slice(0, 10) } : {}),
      },
      turns: Array.isArray(input?.turns)
        ? input.turns
            .filter(
              (turn) =>
                turn && typeof turn.question === "string" && typeof turn.answer === "string",
            )
            .map((turn) => ({
              question: turn.question.slice(0, 300),
              answer: turn.answer.trim().slice(0, 1500),
            }))
            .slice(-12)
        : [],
    }),
  )
  .handler(async ({ data }) => {
    const { nextInterviewQuestion } = await import("./gemini.server");
    return nextInterviewQuestion(data);
  });

/** The latest assisted summary prepared for one check-in. */
export const getEncounterSummary = createServerFn({ method: "GET" })
  .validator((input: { encounterId: string }) => ({
    encounterId: str(input?.encounterId, "The check-in"),
  }))
  .handler(async ({ data }): Promise<SummaryRow | null> => {
    const versions = await (await core()).listSummaries(data.encounterId);
    return versions.length > 0 ? (versions[versions.length - 1] as SummaryRow) : null;
  });

/** The clinician worklist, straight from the encounter records. */
export const listEncounters = createServerFn({ method: "GET" }).handler(
  async (): Promise<EncounterRow[]> => (await core()).listEncounters(),
);

export const searchEncounters = createServerFn({ method: "GET" })
  .validator((input: { query: string }) => ({
    query: String(input?.query ?? "").slice(0, 80),
  }))
  .handler(async ({ data }): Promise<EncounterRow[]> => {
    if (!data.query.trim()) return [];
    return (await core()).searchPatients(data.query);
  });

/** Confirmed information for one encounter. */
export const listEncounterFacts = createServerFn({ method: "GET" })
  .validator((input: { encounterId: string }) => ({
    encounterId: str(input?.encounterId, "The check-in"),
  }))
  .handler(async ({ data }): Promise<FactRow[]> => (await core()).listFacts(data.encounterId));

/* --------------------------------------------------- clinician-only actions */

async function clinician() {
  const { requireClinician } = await import("./auth.server");
  return await requireClinician();
}

export const regenerateSummary = createServerFn({ method: "POST" })
  .validator((input: { encounterId: string }) => ({
    encounterId: str(input?.encounterId, "The encounter"),
  }))
  .handler(async ({ data }): Promise<SummaryRow[]> => {
    await clinician();
    const service = await core();
    await service.regenerateSummary(data.encounterId);
    return service.listSummaries(data.encounterId);
  });

export const saveSummary = createServerFn({ method: "POST" })
  .validator((input: { encounterId: string; expectedVersion: number; body: SummaryBody }) => ({
    encounterId: str(input?.encounterId, "The encounter"),
    expectedVersion: Number(input?.expectedVersion ?? 0),
    body: input?.body as SummaryBody,
  }))
  .handler(async ({ data }) => {
    const user = await clinician();
    const service = await core();
    await service.saveClinicianSummary({ ...data, author: user.label });
    return service.listSummaries(data.encounterId);
  });

export const signSummary = createServerFn({ method: "POST" })
  .validator((input: { encounterId: string; expectedVersion: number }) => ({
    encounterId: str(input?.encounterId, "The encounter"),
    expectedVersion: Number(input?.expectedVersion ?? 0),
  }))
  .handler(async ({ data }) => {
    const user = await clinician();
    const service = await core();
    await service.signSummary({ ...data, author: user.label });
    return service.getEncounterDetail(data.encounterId);
  });

/* ------------------------------------------------------------ patient record */

/**
 * A patient's own encounters plus their signed reports. Whose record is read is
 * decided on the server from the signed-in account, never from the browser.
 */
export const getPatientHistory = createServerFn({ method: "GET" }).handler(async () => {
  const service = await core();
  const { resolveOwnPatientId } = await import("./patient-identity.server");
  const patientId = await resolveOwnPatientId();
  const [encounters, reports] = await Promise.all([
    service.listPatientEncounters(patientId),
    service.listSignedReports(patientId),
  ]);
  const audit = await Promise.all(
    encounters.slice(0, 8).map(async (encounter) => ({
      encounterId: encounter.id,
      events: await service.listAudit(encounter.id),
    })),
  );
  return { patientId, encounters, reports, audit };
});

/** The signed-in person's own details, read from their record. */
export const getMyPatientProfile = createServerFn({ method: "GET" }).handler(async () => {
  const service = await core();
  const { resolveOwnPatientId } = await import("./patient-identity.server");
  const patientId = await resolveOwnPatientId();
  const patient = await service.getPatient(patientId);
  return patient ?? { id: patientId, name: "", age: 0, language: "hi" as const, phone: null };
});

/**
 * Links a check-in finished at the kiosk to the signed-in person, so the visit
 * appears in their own records. Unclaimed records only.
 */
export const claimMyEncounter = createServerFn({ method: "POST" })
  .validator((input: { encounterId: string }) => ({
    encounterId: str(input?.encounterId, "The check-in"),
  }))
  .handler(async ({ data }) => {
    const service = await core();
    const { currentAccountId } = await import("./patient-identity.server");
    const accountId = await currentAccountId();
    if (!accountId) return { patientId: null };
    return { patientId: await service.claimEncounterForAccount(data.encounterId, accountId) };
  });

/** Recent activity across every check-in. */
export const listRecentActivity = createServerFn({ method: "GET" }).handler(async () =>
  (await core()).listRecentAudit(60),
);

/** Confirmed findings across recent check-ins. */
export const listRecentConfirmedFacts = createServerFn({ method: "GET" }).handler(async () =>
  (await core()).listRecentConfirmedFacts(200),
);
