import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Loader2, PenLine, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getEncounter,
  regenerateSummary,
  saveSummary,
  signSummary,
} from "@/lib/clinical/clinical.functions";
import type { EncounterDetail, SummaryBody } from "@/lib/clinical/types";
import { ErrorState, PatientOverviewSkeleton } from "../States";

/**
 * Clinician review and attestation. The assisted draft, the confirmed
 * information it came from and the patient's own words are shown side by side.
 * Nothing is signed until the clinician attests to it.
 */
export function ReviewAttestPage() {
  const { id } = useParams({ from: "/clinician/patients/$id/sign" });
  const [detail, setDetail] = useState<EncounterDetail | null>(null);
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState<SummaryBody | null>(null);
  const [attested, setAttested] = useState(false);
  const [busy, setBusy] = useState<"save" | "sign" | "regenerate" | null>(null);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(async () => {
    try {
      const next = await getEncounter({ data: { encounterId: id } });
      setDetail(next);
      setDraft(next.summaries.at(-1)?.body ?? null);
    } catch {
      setFailed(true);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load, attempt]);

  if (failed) {
    return (
      <ErrorState
        onRetry={() => {
          setFailed(false);
          setAttempt((a) => a + 1);
        }}
      />
    );
  }
  if (!detail) return <PatientOverviewSkeleton />;

  const latest = detail.summaries.at(-1);
  const signed = latest?.status === "SIGNED";
  const confirmed = detail.facts.filter((fact) => fact.status === "confirmed");

  const report = (error: unknown) => {
    const message = error instanceof Error ? error.message : "Something went wrong";
    toast.error(message);
    if (message.toLowerCase().includes("changed since")) void load();
  };

  const onSave = async () => {
    if (!latest || !draft) return;
    setBusy("save");
    try {
      await saveSummary({
        data: { encounterId: id, expectedVersion: latest.version, body: draft },
      });
      toast.success("Your edited version was saved.");
      await load();
    } catch (error) {
      report(error);
    } finally {
      setBusy(null);
    }
  };

  const onRegenerate = async () => {
    setBusy("regenerate");
    try {
      await regenerateSummary({ data: { encounterId: id } });
      toast.success("A new assisted draft was prepared.");
      await load();
    } catch (error) {
      report(error);
    } finally {
      setBusy(null);
    }
  };

  const onSign = async () => {
    if (!latest) return;
    setBusy("sign");
    try {
      await signSummary({ data: { encounterId: id, expectedVersion: latest.version } });
      toast.success("Summary signed. The report is now available to the patient.");
      await load();
    } catch (error) {
      report(error);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <Link
        to="/clinician/patients/$id"
        params={{ id }}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to the case
      </Link>

      <header className="rounded-xl border border-border bg-surface px-5 py-4">
        <h1 className="text-[30px] font-semibold leading-tight tracking-tight">
          Review and attest — {detail.encounter.patientName}
        </h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          Encounter {detail.encounter.id} · {confirmed.length} confirmed items ·{" "}
          {detail.answers.length} patient answers ·{" "}
          {latest
            ? `version ${latest.version} (${latest.status.replace("_", " ").toLowerCase()})`
            : "no draft yet"}
        </p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-lg font-semibold tracking-tight">
              {signed ? "Signed summary" : "AI-assisted draft — not a clinical record until signed"}
            </h2>
          </div>

          {!draft ? (
            <div className="px-5 py-6 text-[15px] text-muted-foreground">
              No assisted draft is available for this encounter.
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => void onRegenerate()}
                  disabled={busy !== null}
                >
                  {busy === "regenerate" ? (
                    <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw aria-hidden="true" className="size-4" />
                  )}
                  Prepare a draft
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 px-5 py-4">
              {draft.sections.map((section, index) => (
                <div key={`${section.heading}-${index}`}>
                  <label
                    htmlFor={`section-${index}`}
                    className="text-[13px] uppercase tracking-wide text-muted-foreground"
                  >
                    {section.heading}
                  </label>
                  <textarea
                    id={`section-${index}`}
                    value={section.content}
                    readOnly={signed}
                    rows={Math.min(6, Math.ceil(section.content.length / 90) + 1)}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        sections: draft.sections.map((item, i) =>
                          i === index ? { ...item, content: event.target.value } : item,
                        ),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-[15px] leading-relaxed focus:border-primary focus:ring-2 focus:ring-primary/25 focus:outline-none read-only:bg-muted/40"
                  />
                </div>
              ))}

              {draft.itemsRequiringReview.length > 0 && (
                <div className="rounded-lg border border-border bg-background px-4 py-3">
                  <h3 className="text-[13px] uppercase tracking-wide text-muted-foreground">
                    Items requiring clinical review
                  </h3>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-[15px]">
                    {draft.itemsRequiringReview.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {!signed && (
                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                  <Button variant="outline" onClick={() => void onSave()} disabled={busy !== null}>
                    {busy === "save" ? (
                      <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                    ) : (
                      <PenLine aria-hidden="true" className="size-4" />
                    )}
                    Save my version
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void onRegenerate()}
                    disabled={busy !== null}
                  >
                    {busy === "regenerate" ? (
                      <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                    ) : (
                      <RefreshCw aria-hidden="true" className="size-4" />
                    )}
                    Regenerate draft
                  </Button>
                </div>
              )}

              {!signed && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-4">
                  <label className="flex items-start gap-3 text-[15px]">
                    <Checkbox
                      checked={attested}
                      onCheckedChange={(value) => setAttested(value === true)}
                    />
                    <span>
                      I have reviewed the confirmed information, the patient&apos;s own responses
                      and this summary, and I attest to it as the responsible clinician.
                    </span>
                  </label>
                  <Button
                    className="mt-4"
                    onClick={() => void onSign()}
                    disabled={!attested || busy !== null}
                  >
                    {busy === "sign" ? (
                      <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                    ) : (
                      <ShieldCheck aria-hidden="true" className="size-4" />
                    )}
                    Sign and complete
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="space-y-5">
          <section className="rounded-xl border border-border bg-surface">
            <h2 className="border-b border-border px-5 py-3 text-lg font-semibold tracking-tight">
              Confirmed information
            </h2>
            <ul className="space-y-3 px-5 py-4">
              {confirmed.length === 0 && (
                <li className="text-[15px] text-muted-foreground">
                  Nothing was confirmed by the patient for this encounter.
                </li>
              )}
              {confirmed.map((fact) => (
                <li
                  key={fact.id}
                  className="rounded-lg border border-border bg-background px-4 py-3"
                >
                  <p className="text-[13px] uppercase tracking-wide text-muted-foreground">
                    {fact.category} · {fact.field}
                  </p>
                  <p className="mt-1 text-[16px] font-medium">{fact.displayValue}</p>
                  {fact.sourceText && (
                    <p className="mt-2 border-l-2 border-secondary/50 pl-3 text-[14px] italic text-muted-foreground">
                      “{fact.sourceText}”
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-surface">
            <h2 className="border-b border-border px-5 py-3 text-lg font-semibold tracking-tight">
              Patient responses
            </h2>
            <ul className="space-y-3 px-5 py-4">
              {detail.answers.map((answer) => (
                <li key={answer.id}>
                  <p className="text-[13px] uppercase tracking-wide text-muted-foreground">
                    {answer.questionText}
                  </p>
                  <p className="mt-1 text-[15px]">{answer.transcript}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-surface">
            <h2 className="border-b border-border px-5 py-3 text-lg font-semibold tracking-tight">
              Version history
            </h2>
            <ol className="space-y-2 px-5 py-4 text-[15px]">
              {detail.summaries.map((version) => (
                <li key={version.id} className="flex items-baseline justify-between gap-3">
                  <span>
                    v{version.version} · {version.status.replace("_", " ").toLowerCase()}
                  </span>
                  <span className="text-[13px] text-muted-foreground">{version.author}</span>
                </li>
              ))}
              {detail.summaries.length === 0 && (
                <li className="text-muted-foreground">No summary versions yet.</li>
              )}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
