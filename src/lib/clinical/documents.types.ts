/**
 * Client-safe shapes for uploaded medical documents, their OCR text and the
 * AI-assisted extraction taken from that text.
 */

export type DocumentStatus =
  | "UPLOADING"
  | "UPLOADED"
  | "OCR_PROCESSING"
  | "OCR_COMPLETED"
  | "EXTRACTION_PROCESSING"
  | "READY_FOR_REVIEW"
  | "REVIEWED"
  | "FAILED";

export type DocumentType =
  | "prescription"
  | "lab_report"
  | "medical_report"
  | "discharge_summary"
  | "previous_consultation"
  | "other";

export interface DocumentRow {
  id: string;
  patientId: string;
  encounterId: string | null;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  documentType: DocumentType;
  source: string;
  status: DocumentStatus;
  errorCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentOcrRow {
  id: string;
  documentId: string;
  provider: string;
  providerVersion: string;
  rawText: string;
  pageCount: number;
  confidence: number | null;
  createdAt: string;
}

export interface DocumentMedication {
  medication: string;
  dose: string | null;
  frequency: string | null;
  duration: string | null;
  evidence: string | null;
}

export interface DocumentLabResult {
  test: string;
  value: string | null;
  unit: string | null;
  referenceRange: string | null;
  evidence: string | null;
}

export interface DocumentEvidenceItem {
  value: string;
  evidence: string | null;
}

export interface DocumentExtractionBody {
  documentType: string | null;
  documentDate: string | null;
  hospitalOrClinic: string | null;
  doctorName: string | null;
  patientName: string | null;
  patientIdentifiers: DocumentEvidenceItem[];
  diagnosesMentioned: DocumentEvidenceItem[];
  symptomsMentioned: DocumentEvidenceItem[];
  medications: DocumentMedication[];
  allergiesMentioned: DocumentEvidenceItem[];
  labResults: DocumentLabResult[];
  vitalValues: DocumentEvidenceItem[];
  procedures: DocumentEvidenceItem[];
  investigations: DocumentEvidenceItem[];
  recommendationsMentioned: DocumentEvidenceItem[];
  followUpInformation: string | null;
  importantFindings: DocumentEvidenceItem[];
  uncertainItems: string[];
}

export interface DocumentExtractionRow {
  id: string;
  documentId: string;
  patientId: string;
  encounterId: string | null;
  model: string;
  modelVersion: string;
  schemaVersion: string;
  status: "COMPLETED" | "FAILED";
  errorMessage: string | null;
  body: DocumentExtractionBody | null;
  createdAt: string;
  updatedAt: string;
}

/** One AI-assisted candidate fact taken from a document, plus its review state. */
export interface DocumentFact {
  id: string;
  documentId: string | null;
  encounterId: string;
  category: string;
  field: string;
  aiValue: string;
  displayValue: string;
  correctedValue: string | null;
  certainty: string;
  evidence: string;
  status: "candidate" | "confirmed" | "discarded";
  review: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface DocumentDetail {
  document: DocumentRow;
  ocr: DocumentOcrRow | null;
  extraction: DocumentExtractionRow | null;
  facts: DocumentFact[];
}

/** A one-off reading of an uploaded file that was not attached to a record. */
export interface DocumentAnalysis {
  fileName: string;
  mimeType: string;
  fileSize: number;
  documentType: DocumentType;
  provider: string;
  pageCount: number;
  confidence: number | null;
  rawText: string;
  structured: DocumentExtractionBody | null;
  structuringError: string | null;
}

/** The text and structured reading of one stored document, for read-back. */
export interface DocumentReading {
  document: DocumentRow;
  rawText: string | null;
  structured: DocumentExtractionBody | null;
  structuringFailed: boolean;
}
