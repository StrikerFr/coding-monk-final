import type { PatientDashboard, PatientProfile, PatientSearchResult } from "../types";

/** Synthetic demonstration data only. No real patient or clinical records. */
export const mockPatientProfile: PatientProfile = {
  id: "MK-DEMO-001",
  name: "Meera Sharma",
  age: 46,
  language: "Hindi",
};

export const mockPatientDashboard: PatientDashboard = {
  latestConsultation: {
    id: "CONS-DEMO-001",
    clinic: "Ayurveda OPD",
    date: "09 September 2026",
    shortDate: "09 Sep 2026",
    concern: "Abdominal discomfort",
    status: "completed",
  },
  recentRecords: [
    {
      id: "REC-DEMO-001",
      kind: "consultation",
      title: "Ayurveda OPD",
      date: "09 Sep 2026",
      status: "Completed",
      description: "Consultation record",
    },
    {
      id: "REC-DEMO-002",
      kind: "report",
      title: "Blood Test",
      date: "09 Sep 2026",
      status: "Available",
      description: "Report added to your records",
    },
    {
      id: "REC-DEMO-003",
      kind: "document",
      title: "Previous Prescription",
      date: "08 Sep 2026",
      status: "Available",
      description: "Document uploaded",
    },
    {
      id: "REC-DEMO-004",
      kind: "intake",
      title: "Ayurveda OPD Intake",
      date: "09 Sep 2026",
      status: "Completed",
      description: "Information you shared before consultation",
    },
  ],
  documents: [
    {
      id: "DOC-DEMO-001",
      title: "Blood Test",
      type: "Report",
      date: "09 Sep 2026",
      status: "available",
    },
    {
      id: "DOC-DEMO-002",
      title: "Previous Prescription",
      type: "Prescription",
      date: "08 Sep 2026",
      status: "available",
    },
  ],
  timeline: [
    {
      id: "TIME-DEMO-001",
      date: "09 Sep",
      title: "Consultation completed",
      detail: "Ayurveda OPD",
      kind: "consultation",
    },
    {
      id: "TIME-DEMO-002",
      date: "09 Sep",
      title: "Information reviewed",
      detail: "Case information reviewed during consultation",
      kind: "review",
    },
    {
      id: "TIME-DEMO-003",
      date: "09 Sep",
      title: "Document added",
      detail: "Blood Test added to your records",
      kind: "document",
    },
    {
      id: "TIME-DEMO-004",
      date: "08 Sep",
      title: "Previous record",
      detail: "Prescription available in documents",
      kind: "document",
    },
  ],
  notifications: [
    {
      id: "NOTE-DEMO-001",
      title: "Your consultation record is ready",
      detail: "Ayurveda OPD · 09 Sep 2026",
      time: "10:32 AM",
      unread: true,
    },
    {
      id: "NOTE-DEMO-002",
      title: "A new document was added",
      detail: "Blood Test",
      time: "9:48 AM",
      unread: true,
    },
    {
      id: "NOTE-DEMO-003",
      title: "Your information was updated",
      detail: "Case information",
      time: "Yesterday",
      unread: false,
    },
  ],
  intakes: [
    {
      id: "INTAKE-DEMO-001",
      title: "Ayurveda OPD Intake",
      date: "09 Sep 2026",
      status: "Completed",
    },
  ],
  consent: { lastReviewed: "09 Sep 2026", status: "review-available" },
  lastUpdated: "Today, 10:32 AM",
};

export const mockPatientSearch: PatientSearchResult[] = [
  {
    id: "SEARCH-1",
    title: "Ayurveda OPD",
    subtitle: "Consultation · 09 Sep 2026",
    kind: "consultation",
    to: "/patient/timeline",
  },
  {
    id: "SEARCH-2",
    title: "Blood Test",
    subtitle: "Report · 09 Sep 2026",
    kind: "report",
    to: "/patient/reports",
  },
  {
    id: "SEARCH-3",
    title: "Previous Prescription",
    subtitle: "Document · 08 Sep 2026",
    kind: "document",
    to: "/patient/documents",
  },
  {
    id: "SEARCH-4",
    title: "Ayurveda OPD Intake",
    subtitle: "Intake · 09 Sep 2026",
    kind: "intake",
    to: "/patient/intakes",
  },
];
