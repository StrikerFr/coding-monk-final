import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import type { WorklistPatient } from "@/features/clinician/types";
import { PriorityBadge } from "./StatusBadges";
import { EmptyState } from "./States";

export function NeedsAttention({ patients }: { patients: WorklistPatient[] }) {
  return (
    <section
      aria-labelledby="needs-attention-heading"
      className="overflow-hidden rounded-lg border border-primary/25 bg-surface shadow-soft"
    >
      <div className="flex items-end justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">Active review queue</p>
          <h2 id="needs-attention-heading" className="mt-1 text-xl font-semibold">
            Needs your attention
          </h2>
        </div>
        <Link
          to="/clinician/worklist"
          className="inline-flex items-center gap-1 rounded text-sm font-semibold text-primary hover:underline"
        >
          View worklist <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      {patients.length === 0 ? (
        <EmptyState
          title="Nothing needs attention"
          description="No urgent or priority cases are waiting right now."
          icon="clear"
        />
      ) : (
        <ul className="divide-y divide-border">
          {patients.map((patient) => (
            <li key={patient.id}>
              <Link
                to="/clinician/patients/$id"
                params={{ id: patient.id }}
                className="group grid gap-3 px-5 py-4 transition-colors hover:bg-surface-sunken/70 sm:grid-cols-[112px_minmax(0,1fr)_auto_auto] sm:items-center"
              >
                <PriorityBadge priority={patient.priority} />
                <span className="min-w-0">
                  <span className="block text-[17px] font-semibold leading-tight">
                    {patient.name}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {patient.age} · {patient.language} · {patient.chiefConcern}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground tabular-nums">
                  <Clock aria-hidden="true" className="size-4" />
                  Waiting {patient.waitingMinutes} min
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Review case
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
