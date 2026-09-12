import { useEffect, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, FileCheck2, Loader2, Pencil, RefreshCw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { completeDocumentReview, getDocument, retryExtraction, reviewFact } from "@/lib/clinical/documents.functions";
import type { DocumentDetail, DocumentFact } from "@/lib/clinical/documents.types";

/**
 * Document review. The clinician always sees the original paper and the exact
 * text it was read from beside every suggested item, and nothing is used until
 * they confirm, correct or reject it.
 */
export function CaseDocumentDialog({
  documentId,
  onClose,
  onReviewed,
}: {
  documentId: string | null;
  onClose: () => void;
  onReviewed?: () => void;
}) {
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [emptyExtractionChecked, setEmptyExtractionChecked] = useState(false);

  useEffect(() => {
    if (!documentId) {
      setDetail(null);
      setEmptyExtractionChecked(false);
      return;
    }
    let active = true;
    setError(null);
    setDetail(null);
    void getDocument({ data: { documentId } })
      .then((next) => {
        if (active) setDetail(next);
      })
      .catch(() => {
        if (active) setError("This document could not be opened.");
      });
    return () => {
      active = false;
    };
  }, [documentId]);

  async function refresh() {
    if (!documentId) return;
    setDetail(await getDocument({ data: { documentId } }));
  }

  async function review(
    fact: DocumentFact,
    action: "confirm" | "correct" | "reject" | "uncertain",
    correctedValue?: string,
  ) {
    setBusy(true);
    try {
      await reviewFact({
        data: { factId: fact.id, action, ...(correctedValue ? { correctedValue } : {}) },
      });
      setEditing(null);
      await refresh();
    } catch {
      setError("That review could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function retry() {
    if (!documentId) return;
    setBusy(true);
    try {
      await retryExtraction({ data: { documentId } });
      await refresh();
    } catch {
      setError("Reading this document again did not work.");
    } finally {
      setBusy(false);
    }
  }

  async function completeReview() {
    if (!documentId) return;
    setBusy(true);
    setError(null);
    try {
      await completeDocumentReview({ data: { documentId, emptyExtractionChecked } });
      await refresh();
      onReviewed?.();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "This review could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  const reviewedCount = detail?.facts.filter((fact) => fact.reviewedAt !== null).length ?? 0;
  const totalCount = detail?.facts.length ?? 0;
  const pendingCount = totalCount - reviewedCount;
  const progress = totalCount === 0 ? 0 : Math.round((reviewedCount / totalCount) * 100);

  return (
    <Dialog open={documentId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto p-0">
        <DialogHeader>
          <div className="border-b border-border px-6 py-5 pr-12">
            <DialogTitle>{detail?.document.fileName ?? "Document verification"}</DialogTitle>
            {detail ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{detail.document.documentType.replaceAll("_", " ")}</Badge>
                <Badge variant={detail.document.status === "REVIEWED" ? "default" : "secondary"}>
                  {detail.document.status === "REVIEWED" ? "Review complete" : "Verification required"}
                </Badge>
              </div>
            ) : null}
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
        {error ? <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}

        {!detail && !error ? (
          <p className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Opening the document…
          </p>
        ) : null}

        {detail ? (
          <div className="space-y-6">
            <section className="rounded-lg border border-border bg-surface-sunken p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Verification progress</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {totalCount === 0 ? "No structured items detected" : `${reviewedCount} of ${totalCount} items reviewed`}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href={`/api/documents/${detail.document.id}/file`} target="_blank" rel="noreferrer">
                    <FileCheck2 aria-hidden="true" className="size-4" /> Open original
                  </a>
                </Button>
              </div>
              {totalCount > 0 ? <Progress className="mt-3" value={progress} aria-label={`${progress}% reviewed`} /> : null}
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div>
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                OCR text
              </h3>
              {detail.ocr ? (
                <pre className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-3 text-sm">
                  {detail.ocr.rawText}
                </pre>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  No text could be read from this document.
                </p>
              )}
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Cross-check steps</h3>
                <ol className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li>1. Open the original prescription or report.</li>
                  <li>2. Compare each detected item with the highlighted source text.</li>
                  <li>3. Confirm, correct, reject, or mark every item uncertain.</li>
                  <li>4. Complete the review only after the checklist is finished.</li>
                </ol>
              </div>
            </section>

            {detail.extraction?.status === "FAILED" || detail.document.status === "FAILED" ? (
              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="text-sm">
                  Assisted reading did not finish for this document. The original file is unchanged.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={busy}
                  onClick={retry}
                >
                  <RefreshCw aria-hidden="true" className="mr-1.5 size-4" /> Try reading again
                </Button>
              </div>
            ) : null}

            <section>
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                Suggested items — your review decides
              </h3>
              {detail.facts.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No items were suggested from this document.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {detail.facts.map((fact) => (
                    <li key={fact.id} className="rounded-lg border border-border bg-background p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex min-w-0 gap-3">
                          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border">
                            {fact.reviewedAt ? <Check className="size-4 text-primary" /> : <span className="size-2 rounded-full bg-muted-foreground" />}
                          </span>
                          <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase text-muted-foreground">{fact.category.replaceAll("_", " ")}</p>
                          <p className="text-[15px] font-semibold">
                            {fact.field}: {fact.correctedValue ?? fact.displayValue}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Read from: “{fact.evidence}” · {fact.certainty.toLowerCase()}
                          </p>
                          {fact.correctedValue ? (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Originally suggested: {fact.aiValue}
                            </p>
                          ) : null}
                          {fact.reviewedAt ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {fact.review === "correct" ? "Corrected" : fact.review === "reject" ? "Rejected" : fact.review === "uncertain" ? "Marked uncertain" : "Confirmed"}
                              {fact.reviewedBy ? ` by ${fact.reviewedBy}` : ""} · {new Date(fact.reviewedAt).toLocaleString()}
                            </p>
                          ) : null}
                          </div>
                        </div>
                        <Badge variant={fact.status === "confirmed" ? "default" : fact.status === "discarded" ? "destructive" : "secondary"}>
                          {fact.status === "candidate"
                            ? (fact.review === "uncertain" ? "Uncertain" : "Awaiting review")
                            : fact.status === "confirmed"
                              ? "Confirmed"
                              : "Rejected"}
                        </Badge>
                      </div>

                      {editing === fact.id ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Input
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            aria-label="Corrected value"
                            className="max-w-sm"
                          />
                          <Button
                            size="sm"
                            disabled={busy || !draft.trim()}
                            onClick={() => void review(fact, "correct", draft.trim())}
                          >
                            Save correction
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => void review(fact, "confirm")}
                          >
                            <Check aria-hidden="true" className="mr-1.5 size-4" /> Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => {
                              setEditing(fact.id);
                              setDraft(fact.correctedValue ?? fact.displayValue);
                            }}
                          >
                            <Pencil aria-hidden="true" className="mr-1.5 size-4" /> Correct
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => void review(fact, "uncertain")}
                          >
                            Mark uncertain
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => void review(fact, "reject")}
                          >
                            <X aria-hidden="true" className="mr-1.5 size-4" /> Reject
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {totalCount === 0 && detail.document.status !== "REVIEWED" ? (
              <label className="flex items-start gap-3 rounded-lg border border-border bg-surface-sunken p-4 text-sm">
                <Checkbox checked={emptyExtractionChecked} onCheckedChange={(checked) => setEmptyExtractionChecked(checked === true)} />
                <span>I checked the original document. No structured clinical items need to be added.</span>
              </label>
            ) : null}

            <section className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-sm">
                {detail.document.status === "REVIEWED" ? (
                  <><CheckCircle2 className="mt-0.5 size-4 text-primary" /><span>This document review is complete and recorded.</span></>
                ) : pendingCount > 0 ? (
                  <><AlertTriangle className="mt-0.5 size-4 text-muted-foreground" /><span>{pendingCount} item{pendingCount === 1 ? "" : "s"} still need a decision.</span></>
                ) : (
                  <><CheckCircle2 className="mt-0.5 size-4 text-primary" /><span>Checklist finished. Complete the review to attest it.</span></>
                )}
              </div>
              {detail.document.status !== "REVIEWED" ? (
                <Button disabled={busy || pendingCount > 0 || (totalCount === 0 && !emptyExtractionChecked)} onClick={() => void completeReview()}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <FileCheck2 className="size-4" />} Complete review
                </Button>
              ) : null}
            </section>
          </div>
        ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
