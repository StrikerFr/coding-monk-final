import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  TriangleAlert,
  PenLine,
  RefreshCw,
  Layers,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PatientCase } from "@/features/clinician/types";
import {
  CaseStatusBadge,
  DemoDataNote,
  PriorityBadge,
  ProvenanceChip,
  ReviewStateBadge,
} from "./StatusBadges";
import { EmptyState } from "./States";
import { CaseDocumentDialog } from "./CaseDocumentDialog";

/**
 * Patient case workspace.
 * Order of priority: identity → status → confirmed facts → evidence → alerts →
 * draft summary → documents → review actions.
 */
export function PatientCaseView({ patientCase }: { patientCase: PatientCase }) {
  const { patient, alerts, documents, draftSummary } = patientCase;
  const [openDocument, setOpenDocument] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <Link
        to="/clinician/worklist"
        className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to worklist
      </Link>

      {/* Patient context header */}
      <header className="rounded-xl border border-border bg-surface px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-semibold leading-tight tracking-tight">
              {patient.name}
            </h1>
            <p className="mt-1 text-[15px] text-muted-foreground">
              {patient.age} years · {patient.language} · Case ID: {patient.caseId}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CaseStatusBadge status={patient.status} />
              <PriorityBadge priority={patient.priority} />
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
                <Clock aria-hidden="true" className="size-4" />
                Waiting {patient.waitingMinutes} min
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => toast("Timeline view is planned for a later build.")}
            >
              View timeline
            </Button>
            <Button asChild>
              <Link to="/clinician/patients/$id/sign" params={{ id: patient.id }}>
                Review &amp; attest
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {/* Overview */}
          <section
            aria-labelledby="case-context-heading"
            className="rounded-xl border border-border bg-surface"
          >
            <h2
              id="case-context-heading"
              className="border-b border-border px-5 py-3 text-lg font-semibold tracking-tight"
            >
              Case context
            </h2>
            <dl className="grid gap-4 px-5 py-4 sm:grid-cols-2">
              <div>
                <dt className="text-[13px] uppercase tracking-wide text-muted-foreground">
                  Chief concern
                </dt>
                <dd className="mt-1 text-[17px] font-medium">{patient.chiefConcern}</dd>
              </div>
              <div>
                <dt className="text-[13px] uppercase tracking-wide text-muted-foreground">
                  Duration
                </dt>
                <dd className="mt-1 text-[17px] font-medium">{patientCase.duration}</dd>
              </div>
              <div>
                <dt className="text-[13px] uppercase tracking-wide text-muted-foreground">
                  Patient-reported symptoms
                </dt>
                <dd className="mt-1 text-[15px]">
                  <ul className="list-inside list-disc space-y-0.5">
                    {patientCase.reportedSymptoms.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-[13px] uppercase tracking-wide text-muted-foreground">
                  Known medications
                </dt>
                <dd className="mt-1 text-[15px]">
                  <ul className="list-inside list-disc space-y-0.5">
                    {patientCase.knownMedications.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-[13px] uppercase tracking-wide text-muted-foreground">
                  Allergies
                </dt>
                <dd className="mt-1 text-[15px]">{patientCase.allergies.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-[13px] uppercase tracking-wide text-muted-foreground">
                  Recent documents
                </dt>
                <dd className="mt-1 text-[15px]">
                  {documents.length > 0
                    ? documents.map((doc) => doc.name).join(", ")
                    : "None uploaded"}
                </dd>
              </div>
            </dl>
          </section>

          {/* Facts / Evidence / Draft */}
          <section
            aria-labelledby="provenance-heading"
            className="rounded-xl border border-border bg-surface"
          >
            <div className="border-b border-border px-5 py-3">
              <h2 id="provenance-heading" className="text-lg font-semibold tracking-tight">
                Information review
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Confirmed facts, source evidence and assisted drafts are kept separate.
              </p>
            </div>

            <Tabs defaultValue="facts" className="px-5 py-4">
              <TabsList>
                <TabsTrigger value="facts">Confirmed facts</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="draft">Draft summary</TabsTrigger>
              </TabsList>

              <TabsContent value="facts" className="mt-4 space-y-3">
                <ProvenanceChip provenance="patient-response" />
                {patientCase.confirmedFacts.map((fact) => (
                  <article
                    key={fact.id}
                    className="rounded-lg border border-border bg-background px-4 py-3"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-[13px] uppercase tracking-wide text-muted-foreground">
                        {fact.label}
                      </h3>
                      <ReviewStateBadge state="confirmed" />
                    </div>
                    <p className="mt-1 text-[17px] font-medium">{fact.value}</p>
                    {fact.patientWords && (
                      <p className="mt-2 border-l-2 border-secondary/50 pl-3 text-[15px] italic text-muted-foreground">
                        “{fact.patientWords}”
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Patient-confirmed · {fact.confirmedAt}
                    </p>
                  </article>
                ))}
              </TabsContent>

              <TabsContent value="evidence" className="mt-4 space-y-3">
                {patientCase.evidence.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-lg border border-dashed border-border bg-surface-sunken/60 px-4 py-3"
                  >
                    <ProvenanceChip provenance={item.provenance} />
                    <h3 className="mt-2 text-[16px] font-semibold">{item.title}</h3>
                    <p className="mt-1 text-[15px] text-muted-foreground">{item.detail}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.reference ? `${item.reference} · ` : ""}
                      Captured {item.capturedAt}
                    </p>
                  </article>
                ))}
              </TabsContent>

              <TabsContent value="draft" className="mt-4">
                <article className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <ProvenanceChip provenance="ai-draft" />
                    <ReviewStateBadge state={draftSummary.reviewState} />
                  </div>
                  <p className="mt-3 text-[16px] leading-relaxed">{draftSummary.body}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Draft generated from {draftSummary.sourceCount} reviewed sources ·{" "}
                    {draftSummary.generatedAt}. Not a clinical conclusion. The clinician decides.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to="/clinician/patients/$id/sign"
                        params={{ id: patientCase.patient.id }}
                      >
                        <PenLine aria-hidden="true" className="size-4" />
                        Edit and sign
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to="/clinician/patients/$id/sign"
                        params={{ id: patientCase.patient.id }}
                      >
                        <RefreshCw aria-hidden="true" className="size-4" />
                        Regenerate draft
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast("Sources are listed under the Evidence tab.")}
                    >
                      <Layers aria-hidden="true" className="size-4" />
                      View sources
                    </Button>
                  </div>
                </article>
              </TabsContent>
            </Tabs>
            <DemoDataNote className="px-5 pb-4" />
          </section>
        </div>

        <div className="space-y-5">
          {/* Alerts */}
          <section
            aria-labelledby="case-alerts-heading"
            className="rounded-xl border border-border bg-surface"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 id="case-alerts-heading" className="text-lg font-semibold tracking-tight">
                Alerts
              </h2>
              <span className="text-sm text-muted-foreground">
                {alerts.length === 0
                  ? "None"
                  : `${alerts.length} item${alerts.length > 1 ? "s" : ""}`}
              </span>
            </div>
            {alerts.length === 0 ? (
              <EmptyState
                title="No alerts"
                description="No items currently require your attention."
                icon="clear"
                className="py-10"
              />
            ) : (
              <ul className="divide-y divide-border">
                {alerts.map((alert) => (
                  <li key={alert.id} className="relative px-4 py-4 pl-12">
                    <TriangleAlert
                      aria-hidden="true"
                      className="absolute left-4 top-4 size-5 text-primary"
                    />
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase text-primary">
                          Review required
                        </p>
                        <h3 className="mt-1 text-[16px] font-semibold">{alert.title}</h3>
                      </div>
                      <ReviewStateBadge state={alert.reviewState} />
                    </div>
                    <p className="mt-1 text-[15px] text-muted-foreground">{alert.explanation}</p>
                    <div className="mt-3 border-l-2 border-primary/35 pl-3">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Sources
                      </p>
                      <p className="mt-0.5 text-sm">{alert.sources.join(" · ")}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2.5"
                      onClick={() => toast("Alert review opens with the alerts workspace build.")}
                    >
                      Review
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Documents */}
          <section
            aria-labelledby="case-documents-heading"
            className="rounded-xl border border-border bg-surface"
          >
            <h2
              id="case-documents-heading"
              className="border-b border-border px-4 py-3 text-lg font-semibold tracking-tight"
            >
              Documents
            </h2>
            {documents.length === 0 ? (
              <EmptyState
                title="No documents"
                description="The patient did not attach any documents at the kiosk."
                className="py-10"
              />
            ) : (
              <ul className="divide-y divide-border">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex items-start gap-3 px-4 py-3">
                    <FileText aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.kind} · {doc.pages} page{doc.pages > 1 ? "s" : ""} · Uploaded{" "}
                        {doc.uploadedAt}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <ReviewStateBadge
                          state={
                            doc.processingStatus === "reviewed"
                              ? "reviewed"
                              : doc.processingStatus === "processing"
                                ? "updated"
                                : "needs-review"
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setOpenDocument(doc.id)}
                          className="rounded text-sm font-medium text-primary hover:underline"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <CaseDocumentDialog documentId={openDocument} onClose={() => setOpenDocument(null)} />
    </div>
  );
}
