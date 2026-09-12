import type {
  PatientDashboard,
  PatientDocument,
  PatientProfile,
  PatientRecord,
  PatientSearchResult,
  PatientTimelineEvent,
} from "./types";
import {
  claimMyEncounter,
  getMyPatientProfile,
  getPatientHistory,
} from "@/lib/clinical/clinical.functions";
import { FINISHED_ENCOUNTER_KEY } from "@/features/patient-kiosk/api";
import { listMyDocuments } from "@/lib/clinical/documents.functions";

/**
 * Data boundary for the patient app. Visits, reports and history come from the
 * patient's own encounter records — the same rows the clinician signed.
 */

const emptyDashboard = (): PatientDashboard => ({
  latestConsultation: {
    id: "no-visit",
    clinic: "MediKiosk",
    date: "—",
    shortDate: "—",
    concern: "No visits recorded yet",
    status: "completed",
  },
  recentRecords: [],
  documents: [],
  timeline: [],
  notifications: [],
  intakes: [],
  consent: { lastReviewed: "—", status: "review-available" },
  lastUpdated: "—",
});

const dateLabel = (iso: string | null) => {
  if (!iso) return "In progress";
  const parsed = new Date(iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(parsed);
};

const EVENT_LABELS: Record<string, string> = {
  INTAKE_STARTED: "Check-in started",
  ANSWER_CONFIRMED: "Answer confirmed by you",
  ANSWER_CORRECTED: "Answer corrected by you",
  INTAKE_COMPLETED: "Check-in completed",
  SUMMARY_GENERATED: "Case prepared for the doctor",
  SUMMARY_EDITED: "Doctor updated the case summary",
  SUMMARY_SIGNED: "Doctor signed your report",
};

/**
 * Attaches check-ins finished on this device to the signed-in person, so their
 * own visits show up here instead of nothing.
 */
async function claimFinishedVisits() {
  if (typeof window === "undefined") return;
  let ids: string[] = [];
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(FINISHED_ENCOUNTER_KEY) ?? "[]",
    ) as unknown;
    ids = Array.isArray(stored) ? stored.map(String) : [];
  } catch {
    return;
  }
  if (ids.length === 0) return;
  for (const encounterId of ids) {
    try {
      await claimMyEncounter({ data: { encounterId } });
    } catch {
      /* the visit stays in the record; it simply is not linked yet */
    }
  }
  try {
    window.localStorage.removeItem(FINISHED_ENCOUNTER_KEY);
  } catch {
    /* nothing to clear */
  }
}

async function history() {
  await claimFinishedVisits();
  return await getPatientHistory();
}

export const patientApi = {
  async getProfile(): Promise<PatientProfile> {
    const row = await getMyPatientProfile();
    return {
      id: row.id,
      name: row.name || "Guest",
      age: row.age,
      language: row.language === "en" ? "English" : "Hindi",
    };
  },

  /** The home screen, built from the person's own visits, reports and papers. */
  async getDashboard(): Promise<PatientDashboard> {
    const [{ encounters, reports, audit }, documents] = await Promise.all([
      history(),
      patientApi.getDocuments(),
    ]);
    if (encounters.length === 0 && reports.length === 0 && documents.length === 0)
      return emptyDashboard();

    const latestEncounter = encounters[0];
    const timeline = await patientApi.getTimeline();
    const recentRecords: PatientRecord[] = [
      ...encounters.slice(0, 2).map((encounter) => ({
        id: `visit-${encounter.id}`,
        kind: "consultation" as const,
        title: encounter.chiefComplaint ?? "Check-in at MediKiosk",
        date: dateLabel(encounter.completedAt ?? encounter.startedAt),
        status: encounter.signedAt ? "Signed by clinician" : "Recorded",
        description: "Your consultation record",
      })),
      ...reports.slice(0, 1).map((report) => ({
        id: `report-${report.id}`,
        kind: "report" as const,
        title: report.chiefComplaint
          ? `Consultation report — ${report.chiefComplaint}`
          : "Consultation report",
        date: dateLabel(report.createdAt),
        status: "Signed by clinician",
        description: "Signed consultation summary",
      })),
      ...documents.slice(0, 1).map((document) => ({
        id: `doc-${document.id}`,
        kind: "document" as const,
        title: document.title,
        date: document.date,
        status: "Available",
        description: `${document.type} you added`,
      })),
    ];

    const notifications = audit
      .flatMap((entry) => entry.events.map((event) => ({ ...event, encounterId: entry.encounterId })))
      .filter((event) => EVENT_LABELS[event.action])
      .slice(-3)
      .reverse()
      .map((event) => ({
        id: `${event.encounterId}-${event.id}`,
        title: EVENT_LABELS[event.action] as string,
        detail: dateLabel(event.createdAt),
        time: dateLabel(event.createdAt),
        unread: false,
      }));

    return {
      latestConsultation: {
        id: latestEncounter?.id ?? "no-visit",
        clinic: "MediKiosk check-in",
        date: dateLabel(latestEncounter?.completedAt ?? latestEncounter?.startedAt ?? null),
        shortDate: dateLabel(latestEncounter?.completedAt ?? latestEncounter?.startedAt ?? null),
        concern: latestEncounter?.chiefComplaint ?? "Check-in recorded",
        status: "completed" as const,
      },
      recentRecords,
      documents,
      timeline,
      notifications,
      intakes: await patientApi.getIntakes(),
      consent: {
        lastReviewed: dateLabel(latestEncounter?.startedAt ?? null),
        status: "review-available" as const,
      },
      lastUpdated: dateLabel(latestEncounter?.startedAt ?? null),
    };
  },

  /** Real events from the patient's visits, newest first. */
  async getTimeline(): Promise<PatientTimelineEvent[]> {
    const { audit, encounters } = await history();
    const events: PatientTimelineEvent[] = [];
    for (const entry of audit) {
      const encounter = encounters.find((item) => item.id === entry.encounterId);
      for (const event of entry.events) {
        const label = EVENT_LABELS[event.action];
        if (!label) continue;
        events.push({
          id: `${entry.encounterId}-${event.id}`,
          date: dateLabel(event.createdAt),
          title: label,
          detail: encounter?.chiefComplaint ?? "Check-in at MediKiosk",
          kind: event.action === "SUMMARY_SIGNED" ? "report" : "intake",
        });
      }
    }
    return events.reverse();
  },

  /** Papers the patient added themselves, straight from their record. */
  async getDocuments(): Promise<PatientDocument[]> {
    const rows = await listMyDocuments();
    return rows.map((row) => ({
      id: row.id,
      title: row.fileName,
      type: row.documentType === "prescription" ? "Prescription" : "Report",
      date: dateLabel(row.createdAt),
      status: "available" as const,
    }));
  },

  /** Signed reports only. Nothing is shown before a clinician signs it. */
  async getReports(): Promise<PatientRecord[]> {
    const { reports } = await history();
    return reports.map((report) => ({
      id: report.id,
      kind: "report" as const,
      title: report.chiefComplaint
        ? `Consultation report — ${report.chiefComplaint}`
        : "Consultation report",
      date: dateLabel(report.createdAt),
      status: "Signed by clinician",
      sections: report.body.sections.map((section) => ({
        heading: section.heading,
        content: section.content,
      })),
      description:
        report.body.sections
          .slice(0, 2)
          .map((section) => `${section.heading}: ${section.content}`)
          .join(" · ")
          .slice(0, 240) || "Signed consultation summary",
    }));
  },

  /** The patient's own visits. */
  async getIntakes() {
    const { encounters } = await history();
    return encounters.map((encounter) => ({
      id: encounter.id,
      title: encounter.chiefComplaint ?? "Check-in",
      date: dateLabel(encounter.completedAt ?? encounter.startedAt),
      status: (encounter.status === "completed" ? "Completed" : "Completed") as "Completed",
    }));
  },

  async getConsents() {
    const { encounters } = await history();
    const latest = encounters[0];
    return {
      lastReviewed: dateLabel(latest?.startedAt ?? null),
      status: "review-available" as const,
    };
  },
  getNotifications: async () => (await patientApi.getDashboard()).notifications,

  /** Searches the person's own visits, reports and papers. */
  async search(query: string): Promise<PatientSearchResult[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    const [{ encounters, reports }, documents] = await Promise.all([
      history(),
      patientApi.getDocuments(),
    ]);
    const items: PatientSearchResult[] = [
      ...encounters.map((encounter) => ({
        id: `visit-${encounter.id}`,
        title: encounter.chiefComplaint ?? "Check-in at MediKiosk",
        subtitle: `Visit · ${dateLabel(encounter.completedAt ?? encounter.startedAt)}`,
        kind: "intake" as const,
        to: "/patient/intakes" as const,
      })),
      ...reports.map((report) => ({
        id: `report-${report.id}`,
        title: report.chiefComplaint
          ? `Consultation report — ${report.chiefComplaint}`
          : "Consultation report",
        subtitle: `Report · ${dateLabel(report.createdAt)}`,
        kind: "report" as const,
        to: "/patient/reports" as const,
      })),
      ...documents.map((document) => ({
        id: `doc-${document.id}`,
        title: document.title,
        subtitle: `${document.type} · ${document.date}`,
        kind: "document" as const,
        to: "/patient/documents" as const,
      })),
    ];
    return items.filter((item) =>
      `${item.title} ${item.subtitle}`.toLowerCase().includes(normalized),
    );
  },
};
