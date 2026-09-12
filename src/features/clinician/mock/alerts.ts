import type { CaseAlert } from "../types";

/**
 * SYNTHETIC DEMO DATA ONLY.
 * The frontend never detects these. The future Rules Service produces alert
 * objects; this UI only renders them.
 */
export const mockAlerts: Record<string, CaseAlert[]> = {
  "MK-DEMO-001": [
    {
      id: "ALERT-001",
      title: "Possible inconsistency",
      explanation:
        "Medication information differs between the patient response and the uploaded prescription. Please confirm with the patient.",
      sources: ["Patient response", "Uploaded document"],
      reviewState: "needs-review",
      severity: "attention",
    },
  ],
  "MK-DEMO-003": [
    {
      id: "ALERT-002",
      title: "Incomplete information",
      explanation: "Duration of the reported symptom was not confirmed during check-in.",
      sources: ["Patient response"],
      reviewState: "needs-review",
      severity: "attention",
    },
    {
      id: "ALERT-003",
      title: "Earlier record available",
      explanation: "A previous visit record was matched to this case for context.",
      sources: ["Previous record"],
      reviewState: "reviewed",
      severity: "information",
    },
  ],
  "MK-DEMO-006": [
    {
      id: "ALERT-004",
      title: "Document still processing",
      explanation: "An uploaded document has not finished review yet.",
      sources: ["Uploaded document"],
      reviewState: "needs-review",
      severity: "information",
    },
  ],
};
