import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Sparkles,
  TriangleAlert,
  UserRoundCheck,
} from "lucide-react";
import type { PatientCase } from "@/features/clinician/types";
import { PriorityBadge } from "./StatusBadges";

export function NextCasePreview({ patientCase }: { patientCase: PatientCase }) {
  const { patient, confirmedFacts, evidence, alerts, documents, draftSummary } = patientCase;
  const stages = [
    {
      label: "Confirmed",
      value: `${confirmedFacts.length} facts`,
      detail: "Patient-confirmed",
      icon: CheckCircle2,
      tone: "text-accent-foreground bg-accent/70",
    },
    {
      label: "Source evidence",
      value: `${evidence.length} sources`,
      detail: `${documents.length} documents attached`,
      icon: FileSearch,
      tone: "text-foreground bg-surface-sunken",
    },
    {
      label: "Needs review",
      value: `${alerts.length} item${alerts.length === 1 ? "" : "s"}`,
      detail: "Clinician attention required",
      icon: TriangleAlert,
      tone: "text-primary bg-primary/10",
    },
    {
      label: "Assisted draft",
      value: draftSummary.reviewState === "needs-review" ? "Ready" : "Reviewed",
      detail: "Not a clinical conclusion",
      icon: Sparkles,
      tone: "text-primary bg-primary-soft/30",
    },
  ];

  return (
    <section
      aria-labelledby="next-case-heading"
      className="overflow-hidden rounded-lg border border-border bg-surface"
    >
      <div className="grid lg:grid-cols-[minmax(230px,0.7fr)_minmax(0,1.8fr)]">
        <div className="border-b border-border bg-foreground px-5 py-5 text-background lg:border-b-0 lg:border-r">
          <p className="text-xs font-semibold uppercase text-background/65">Next case</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h2 id="next-case-heading" className="text-2xl font-semibold">
              {patient.name}
            </h2>
            <PriorityBadge
              priority={patient.priority}
              className="border-background/30 bg-background/10 text-background"
            />
          </div>
          <p className="mt-1 text-sm text-background/70">
            {patient.age} · {patient.language} · Waiting {patient.waitingMinutes} min
          </p>
          <p className="mt-4 text-[17px] font-medium">{patient.chiefConcern}</p>
          <p className="mt-1 text-sm text-background/65">Duration: {patientCase.duration}</p>
        </div>

        <div className="px-5 py-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Prepared case pathway
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Source and review states remain clearly separated.
              </p>
            </div>
            <Link
              to="/clinician/patients/$id"
              params={{ id: patient.id }}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Open clinical review
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <ol className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-5">
            {stages.map((stage) => (
              <li key={stage.label} className="bg-surface px-3 py-3">
                <div className={`flex size-7 items-center justify-center rounded-md ${stage.tone}`}>
                  <stage.icon aria-hidden="true" className="size-4" />
                </div>
                <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">
                  {stage.label}
                </p>
                <p className="mt-0.5 text-[16px] font-semibold">{stage.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stage.detail}</p>
              </li>
            ))}
            <li className="bg-accent/45 px-3 py-3">
              <div className="flex size-7 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <UserRoundCheck aria-hidden="true" className="size-4" />
              </div>
              <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">
                Clinician
              </p>
              <p className="mt-0.5 text-[16px] font-semibold">Final review</p>
              <p className="mt-1 text-xs text-muted-foreground">You remain the decision-maker</p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
