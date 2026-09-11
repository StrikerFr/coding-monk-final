/**
 * Server-only OCR access (OCR.space). The key never leaves the server and no
 * document text is ever logged — only provider status codes.
 */

export type OcrFailureCode =
  | "OCR_FAILED"
  | "OCR_EMPTY_RESULT"
  | "OCR_PROVIDER_ERROR"
  | "UNSUPPORTED_DOCUMENT"
  | "DOCUMENT_TOO_LARGE"
  | "OCR_NOT_CONFIGURED"
  | "OCR_TIMEOUT";

export class OcrError extends Error {
  code: OcrFailureCode;
  constructor(code: OcrFailureCode, message: string) {
    super(message);
    this.name = "OcrError";
    this.code = code;
  }
}

const ENDPOINT = "https://api.ocr.space/parse/image";

/** OCR.space accepts these; anything else is rejected before an API call. */
export const OCR_SUPPORTED: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
  "image/jpg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
  "image/gif": "GIF",
  "image/tiff": "TIF",
  "image/bmp": "BMP",
};

/** OCR.space free plan caps uploads at 1 MB per file. */
export const OCR_MAX_BYTES = 1024 * 1024;

export interface OcrResult {
  provider: "ocr.space";
  providerVersion: string;
  rawText: string;
  pageCount: number;
  confidence: number | null;
}

interface OcrSpaceResponse {
  ParsedResults?: Array<{
    ParsedText?: string;
    TextOverlay?: { Lines?: unknown[] };
    FileParseExitCode?: number;
    ErrorMessage?: string;
    MeanConfidence?: number;
  }>;
  OCRExitCode?: number;
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string | string[];
  ErrorDetails?: string;
  OCRVersion?: string;
  ProcessingTimeInMilliseconds?: string;
}

/** Runs OCR on one stored document. Throws OcrError with a safe code. */
export async function runOcr(input: {
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
}): Promise<OcrResult> {
  const key = process.env["OCR_SPACE_API_KEY"];
  if (!key) throw new OcrError("OCR_NOT_CONFIGURED", "Document reading is not configured");

  const fileType = OCR_SUPPORTED[input.mimeType.toLowerCase()];
  if (!fileType) throw new OcrError("UNSUPPORTED_DOCUMENT", "This file type cannot be read");
  if (input.bytes.byteLength > OCR_MAX_BYTES) {
    throw new OcrError("DOCUMENT_TOO_LARGE", "This file is too large to be read");
  }

  const form = new FormData();
  form.append("language", "eng");
  form.append("isOverlayRequired", "false");
  form.append("filetype", fileType);
  form.append("OCREngine", "2");
  form.append("scale", "true");
  form.append("detectOrientation", "true");
  form.append(
    "file",
    new Blob([input.bytes as unknown as BlobPart], { type: input.mimeType }),
    input.fileName,
  );

  // The shared reading service throttles bursts; a busy reply is retried with
  // backoff before the document is marked as failed.
  let response: Response | null = null;
  let transport: OcrError | null = null;
  for (const delay of [0, 3000, 8000, 15_000]) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    try {
      response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { apikey: key },
        body: form,
        signal: AbortSignal.timeout(60_000),
      });
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "TimeoutError";
      transport = new OcrError(
        timedOut ? "OCR_TIMEOUT" : "OCR_PROVIDER_ERROR",
        timedOut ? "Reading this document took too long" : "The document reader was unavailable",
      );
      response = null;
      continue;
    }
    if (response.status === 429 || response.status >= 500) continue;
    break;
  }

  if (!response)
    throw transport ?? new OcrError("OCR_PROVIDER_ERROR", "The reader was unavailable");

  if (response.status === 403 || response.status === 401) {
    throw new OcrError("OCR_PROVIDER_ERROR", "The document reader rejected the request");
  }
  if (response.status === 429 || response.status >= 500) {
    throw new OcrError("OCR_PROVIDER_ERROR", "The document reader is busy — please try again");
  }
  if (!response.ok) {
    throw new OcrError("OCR_PROVIDER_ERROR", `The document reader failed (${response.status})`);
  }

  let payload: OcrSpaceResponse;
  try {
    payload = (await response.json()) as OcrSpaceResponse;
  } catch {
    throw new OcrError("OCR_PROVIDER_ERROR", "The document reader returned unreadable data");
  }

  if (payload.IsErroredOnProcessing || payload.OCRExitCode === 99 || payload.OCRExitCode === 3) {
    throw new OcrError("OCR_FAILED", "This document could not be read");
  }

  const parsed = payload.ParsedResults ?? [];
  const rawText = parsed
    .map((page) => (page.ParsedText ?? "").trim())
    .filter(Boolean)
    .join("\n\n--- page break ---\n\n")
    .trim();

  if (!rawText) throw new OcrError("OCR_EMPTY_RESULT", "No readable text was found");

  const confidences = parsed
    .map((page) => page.MeanConfidence)
    .filter((value): value is number => typeof value === "number");

  return {
    provider: "ocr.space",
    providerVersion: String(payload.OCRVersion ?? "unknown"),
    rawText: rawText.slice(0, 60_000),
    pageCount: parsed.length || 1,
    confidence:
      confidences.length > 0
        ? confidences.reduce((sum, value) => sum + value, 0) / confidences.length
        : null,
  };
}
