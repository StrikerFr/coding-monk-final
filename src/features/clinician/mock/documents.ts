import type { CaseDocument } from "../types";

/** SYNTHETIC DEMO DATA ONLY. No OCR or document processing happens here. */
export const mockDocuments: Record<string, CaseDocument[]> = {
  "MK-DEMO-001": [
    {
      id: "DOC-001",
      name: "Blood Test",
      kind: "Laboratory report",
      uploadedAt: "09 Sep 2026",
      processingStatus: "reviewed",
      pages: 2,
    },
    {
      id: "DOC-002",
      name: "Previous Prescription",
      kind: "Prescription",
      uploadedAt: "09 Sep 2026",
      processingStatus: "needs-review",
      pages: 1,
    },
  ],
  "MK-DEMO-002": [
    {
      id: "DOC-003",
      name: "Knee X-ray Report",
      kind: "Imaging report",
      uploadedAt: "09 Sep 2026",
      processingStatus: "processing",
      pages: 3,
    },
  ],
  "MK-DEMO-003": [
    {
      id: "DOC-004",
      name: "Discharge Summary",
      kind: "Hospital record",
      uploadedAt: "08 Sep 2026",
      processingStatus: "reviewed",
      pages: 4,
    },
  ],
};
