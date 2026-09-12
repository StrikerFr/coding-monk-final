import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { stepNumber } from "@/features/patient-kiosk/session";
import type { KioskTranslationKey } from "@/features/patient-kiosk/translations/en";
import {
  listEncounterDocuments,
  processDocument,
  uploadDocument,
} from "@/lib/clinical/documents.functions";
import type { DocumentRow } from "@/lib/clinical/documents.types";
import { KioskChoice } from "../KioskChoice";
import { KioskStepContainer } from "../KioskStepContainer";
import { KioskStepNav } from "../KioskStepNav";
import { KioskText } from "../KioskText";

const PAPERS: Array<{ id: string; key: KioskTranslationKey }> = [
  { id: "prescription", key: "kiosk.docs.prescription" },
  { id: "reports", key: "kiosk.docs.reports" },
  { id: "card", key: "kiosk.docs.card" },
];

const MAX_BYTES = 1024 * 1024;

/**
 * The patient tells us what papers they carry and may add a photo of them. A
 * photo is stored on their record and read for the clinician, who reviews every
 * item before it is used.
 */
export function DocumentsPage() {
  const { updateSession, session } = useKiosk();
  const [selected, setSelected] = useState<string[]>(session?.paperTypes ?? []);
  const [none, setNone] = useState(false);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [busy, setBusy] = useState<null | "upload" | "read">(null);
  const [error, setError] = useState<KioskTranslationKey | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const encounterId = session?.encounterId ?? null;

  useEffect(() => {
    if (!encounterId) return;
    let active = true;
    void listEncounterDocuments({ data: { encounterId } })
      .then((rows) => {
        if (active) setDocuments(rows);
      })
      .catch(() => {
        /* the list simply stays empty */
      });
    return () => {
      active = false;
    };
  }, [encounterId]);

  const toggle = (id: string) => {
    setNone(false);
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  async function handleFile(file: File) {
    if (!encounterId) return;
    setError(null);
    if (file.size > MAX_BYTES) {
      setError("kiosk.docs.tooLarge");
      return;
    }
    setBusy("upload");
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });
      const stored = await uploadDocument({
        data: {
          encounterId,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          documentType: selected.includes("reports") ? "lab_report" : "prescription",
          base64,
          source: "patient-kiosk",
        },
      });
      setDocuments((current) => [stored, ...current.filter((row) => row.id !== stored.id)]);
      setBusy("read");
      const result = await processDocument({ data: { documentId: stored.id } });
      if (result.status === "FAILED") setError("kiosk.docs.readingFailed");
      const refreshed = await listEncounterDocuments({ data: { encounterId } });
      setDocuments(refreshed);
    } catch {
      setError("kiosk.docs.uploadFailed");
    } finally {
      setBusy(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <KioskStepContainer step={stepNumber("documents")}>
      <div className="mx-auto max-w-3xl">
        <KioskText
          tkey="kiosk.docs.heading"
          as="h1"
          className="text-2xl font-semibold sm:text-3xl"
          secondaryClassName="text-lg font-normal"
        />
        <KioskText
          tkey="kiosk.docs.support"
          as="p"
          className="mt-1 text-sm sm:text-base text-muted-foreground"
        />

        <div className="mt-3 sm:mt-4 grid gap-2.5 sm:grid-cols-2">
          {PAPERS.map((paper) => (
            <KioskChoice
              key={paper.id}
              tkey={paper.key}
              selected={selected.includes(paper.id)}
              onSelect={() => toggle(paper.id)}
            />
          ))}
          <KioskChoice
            tkey="kiosk.docs.none"
            selected={none}
            onSelect={() => {
              setNone(!none);
              setSelected([]);
            }}
          />
        </div>

        {encounterId ? (
          <section
            aria-labelledby="kiosk-upload-heading"
            className="mt-3 sm:mt-4 rounded-2xl border border-border bg-surface p-4 sm:p-5"
          >
            <h2 id="kiosk-upload-heading" className="sr-only">
              Add a photo of your papers
            </h2>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <KioskText
                  tkey="kiosk.docs.uploadHeading"
                  as="p"
                  className="text-base font-semibold sm:text-lg"
                  secondaryClassName="text-sm font-normal"
                />
                <KioskText
                  tkey="kiosk.docs.uploadSupport"
                  as="p"
                  className="mt-0.5 text-xs sm:text-sm text-muted-foreground"
                />
              </div>

              <button
                type="button"
                disabled={busy !== null}
                onClick={() => fileInput.current?.click()}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm sm:text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
              >
                {busy ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <Upload aria-hidden="true" className="size-4" />
                )}
                <KioskText
                  tkey={
                    busy === "upload"
                      ? "kiosk.docs.uploading"
                      : busy === "read"
                        ? "kiosk.docs.reading"
                        : "kiosk.docs.uploadButton"
                  }
                  as="span"
                  secondaryClassName="text-sm font-normal"
                />
              </button>
            </div>

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

            {error ? (
              <p role="status" className="mt-3 text-sm text-destructive">
                <KioskText tkey={error} as="span" secondaryClassName="text-sm" />
              </p>
            ) : null}

            {documents.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {documents.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-start gap-2.5 rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  >
                    <FileText aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{row.fileName}</p>
                      <KioskText
                        tkey={
                          row.status === "FAILED"
                            ? "kiosk.docs.readingFailed"
                            : row.status === "READY_FOR_REVIEW" ||
                                row.status === "REVIEWED" ||
                                row.status === "OCR_COMPLETED"
                              ? "kiosk.docs.uploaded"
                              : "kiosk.docs.reading"
                        }
                        as="p"
                        className="text-xs text-muted-foreground"
                        secondaryClassName="text-xs"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        <KioskStepNav
          stepId="documents"
          showSkip
          note="kiosk.docs.note"
          onContinue={() => updateSession({ paperTypes: none ? [] : selected })}
          onSkip={() => updateSession({ paperTypes: none ? [] : selected })}
        />
      </div>
    </KioskStepContainer>
  );
}
