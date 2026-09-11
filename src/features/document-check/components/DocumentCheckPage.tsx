import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, Loader2, Upload } from "lucide-react";
import { StructuredDocumentView } from "@/components/documents/StructuredDocumentView";
import { analyzeDocument } from "@/lib/clinical/documents.functions";
import type { DocumentAnalysis, DocumentType } from "@/lib/clinical/documents.types";

const MAX_BYTES = 1024 * 1024;

const TYPES: Array<{ id: DocumentType; label: string }> = [
  { id: "prescription", label: "Prescription" },
  { id: "lab_report", label: "Test report" },
  { id: "medical_report", label: "Medical report" },
  { id: "discharge_summary", label: "Discharge summary" },
  { id: "previous_consultation", label: "Earlier consultation" },
  { id: "other", label: "Something else" },
];

/**
 * A standalone page for checking one paper on its own: the file is read, the
 * text found in it is shown in full, and the organised version is shown beside
 * it. Nothing is saved to any patient record here.
 */
export function DocumentCheckPage() {
  const [documentType, setDocumentType] = useState<DocumentType>("prescription");
  const [result, setResult] = useState<DocumentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    if (file.size > MAX_BYTES) {
      setError("This file is larger than 1 MB. Please use a smaller photo or PDF.");
      return;
    }
    setBusy(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });
      const analysis = await analyzeDocument({
        data: {
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          documentType,
          base64,
        },
      });
      setResult(analysis);
    } catch {
      setError(
        "This paper could not be read. Please try a clearer photo, or a PDF, JPG, PNG or WebP file.",
      );
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" /> Back to MediKiosk
        </Link>

        <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">Check a document</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Upload a prescription or report to see the text found in it and the organised version of
          that text. This page does not save anything to a patient record, and a clinician still
          decides what is used.
        </p>

        <section
          aria-labelledby="upload-heading"
          className="mt-8 rounded-3xl border border-border bg-surface p-6"
        >
          <h2 id="upload-heading" className="text-lg font-semibold">
            1. Choose what this paper is
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                aria-pressed={documentType === type.id}
                onClick={() => setDocumentType(type.id)}
                className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  documentType === type.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <h2 className="mt-8 text-lg font-semibold">2. Add the file</h2>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) void handleFile(file);
            }}
            className={`mt-4 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
              dragging ? "border-primary bg-primary/5" : "border-border bg-background"
            }`}
          >
            <FileText aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-base">Drop a PDF, JPG, PNG or WebP file here, up to 1 MB.</p>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInput.current?.click()}
              className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
            >
              {busy ? (
                <Loader2 aria-hidden="true" className="size-5 animate-spin" />
              ) : (
                <Upload aria-hidden="true" className="size-5" />
              )}
              {busy ? "Reading the document…" : "Choose a file"}
            </button>
          </div>

          {error ? (
            <p role="status" className="mt-4 text-base text-destructive">
              {error}
            </p>
          ) : null}
        </section>

        {result ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-border bg-surface p-6">
              <h2 className="text-lg font-semibold">Text read from the document</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.fileName} · {Math.round(result.fileSize / 1024)} KB · {result.pageCount}{" "}
                page
                {result.pageCount === 1 ? "" : "s"}
              </p>
              {result.rawText.trim() ? (
                <pre className="mt-4 max-h-[32rem] overflow-y-auto rounded-2xl border border-border bg-background p-4 text-sm whitespace-pre-wrap">
                  {result.rawText}
                </pre>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No text could be read from this file.
                </p>
              )}
            </section>

            <section className="rounded-3xl border border-border bg-surface p-6">
              <h2 className="text-lg font-semibold">Structured document</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Organised from the text above. Suggestions only — a clinician confirms them.
              </p>
              <div className="mt-4">
                {result.structured ? (
                  <StructuredDocumentView body={result.structured} />
                ) : (
                  <p className="text-sm text-destructive">
                    The text was read, but it could not be organised this time. Please try again.
                  </p>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
