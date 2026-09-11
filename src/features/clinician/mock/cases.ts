import type { PatientCase, WorklistPatient } from "../types";
import { mockWorklist } from "./patients";
import { mockDocuments } from "./documents";
import { mockAlerts } from "./alerts";

/** SYNTHETIC DEMO DATA ONLY. No clinical conclusions are made anywhere here. */

interface CaseDetail {
  duration: string;
  reportedSymptoms: string[];
  knownMedications: string[];
  allergies: string[];
  confirmedFacts: PatientCase["confirmedFacts"];
  evidence: PatientCase["evidence"];
  draftSummary: PatientCase["draftSummary"];
}

const fallbackDetail = (patient: WorklistPatient): CaseDetail => ({
  duration: "3 days",
  reportedSymptoms: [patient.chiefConcern, "Reduced appetite"],
  knownMedications: ["None reported"],
  allergies: ["None reported"],
  confirmedFacts: [
    {
      id: `${patient.id}-F1`,
      label: "Main concern",
      value: patient.chiefConcern,
      patientWords: "I have been feeling unwell for a few days.",
      confirmedAt: "09 Sep 2026, 10:12",
    },
    {
      id: `${patient.id}-F2`,
      label: "Duration",
      value: "3 days",
      confirmedAt: "09 Sep 2026, 10:13",
    },
  ],
  evidence: [
    {
      id: `${patient.id}-E1`,
      provenance: "patient-response",
      title: "Check-in response",
      detail: "Answer recorded during kiosk check-in.",
      capturedAt: "09 Sep 2026, 10:12",
    },
  ],
  draftSummary: {
    id: `${patient.id}-D1`,
    body: `Patient reports ${patient.chiefConcern.toLowerCase()} for approximately three days. Additional information was collected during check-in and is listed under confirmed facts.`,
    generatedAt: "09 Sep 2026, 10:16",
    reviewState: "needs-review",
    sourceCount: 3,
  },
});

const details: Record<string, CaseDetail> = {
  "MK-DEMO-001": {
    duration: "3 days",
    reportedSymptoms: ["Abdominal discomfort after meals", "Reduced appetite", "Occasional nausea"],
    knownMedications: ["Antacid tablets (patient-reported)", "Multivitamin"],
    allergies: ["None reported"],
    confirmedFacts: [
      {
        id: "F-001",
        label: "Main concern",
        value: "Abdominal discomfort",
        patientWords: "पेट में तीन दिन से तकलीफ़ है। (Stomach discomfort for about three days.)",
        confirmedAt: "09 Sep 2026, 10:12",
      },
      {
        id: "F-002",
        label: "Duration",
        value: "3 days",
        confirmedAt: "09 Sep 2026, 10:12",
      },
      {
        id: "F-003",
        label: "Pattern",
        value: "Worse after meals",
        patientWords: "खाने के बाद ज़्यादा होता है।",
        confirmedAt: "09 Sep 2026, 10:14",
      },
      {
        id: "F-004",
        label: "Allergies",
        value: "None reported",
        confirmedAt: "09 Sep 2026, 10:15",
      },
    ],
    evidence: [
      {
        id: "E-001",
        provenance: "patient-response",
        title: "Spoken check-in answer",
        detail: "Patient described the concern in Hindi and confirmed the written note on screen.",
        capturedAt: "09 Sep 2026, 10:12",
      },
      {
        id: "E-002",
        provenance: "uploaded-document",
        title: "Previous Prescription",
        detail: "Lists an antacid and one additional medication.",
        capturedAt: "09 Sep 2026, 10:09",
        reference: "DOC-002 · page 1",
      },
      {
        id: "E-003",
        provenance: "uploaded-document",
        title: "Blood Test",
        detail: "Laboratory report attached by the patient at the kiosk.",
        capturedAt: "09 Sep 2026, 10:09",
        reference: "DOC-001 · pages 1–2",
      },
      {
        id: "E-004",
        provenance: "previous-record",
        title: "Earlier visit note",
        detail: "A previous visit at this facility was matched for context.",
        capturedAt: "21 Aug 2026",
        reference: "MK-DEMO-001 · visit 2",
      },
    ],
    draftSummary: {
      id: "D-001",
      body: "Patient reports abdominal discomfort for approximately three days, described as worse after meals, with reduced appetite and occasional nausea. Patient reports taking antacid tablets. An uploaded prescription lists additional medication that the patient did not mention during check-in. No allergies were reported.",
      generatedAt: "09 Sep 2026, 10:16",
      reviewState: "needs-review",
      sourceCount: 4,
    },
  },
};

export function getMockCase(id: string): PatientCase | null {
  const patient = mockWorklist.find((p) => p.id === id);
  if (!patient) return null;
  const detail = details[id] ?? fallbackDetail(patient);

  return {
    patient,
    duration: detail.duration,
    reportedSymptoms: detail.reportedSymptoms,
    knownMedications: detail.knownMedications,
    allergies: detail.allergies,
    confirmedFacts: detail.confirmedFacts,
    evidence: detail.evidence,
    draftSummary: detail.draftSummary,
    documents: mockDocuments[id] ?? [],
    alerts: mockAlerts[id] ?? [],
  };
}
