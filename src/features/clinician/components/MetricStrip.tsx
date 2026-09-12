import { AlertTriangle, ArrowUpRight, CheckCircle2, ClipboardCheck, Users } from "lucide-react";
import type { DashboardMetrics } from "@/features/clinician/types";

/** Compact operational counters. Demo values, not statistics. */
export function MetricStrip({ metrics }: { metrics: DashboardMetrics }) {
  const items = [
    { label: "Waiting", value: metrics.waiting, icon: Users },
    { label: "Priority", value: metrics.priority, icon: ArrowUpRight },
    { label: "Urgent", value: metrics.urgent, icon: AlertTriangle },
    { label: "Ready for review", value: metrics.ready, icon: ClipboardCheck },
    { label: "Completed", value: metrics.completedToday, icon: CheckCircle2 },
  ];

  return (
    <dl className="grid overflow-hidden rounded-lg border border-border bg-surface sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="group relative min-h-24 border-b border-border px-4 py-3.5 last:border-b-0 sm:[&:nth-child(odd)]:border-r xl:min-h-0 xl:border-b-0 xl:border-r xl:last:border-r-0 xl:[&:nth-child(odd)]:border-r"
        >
          <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform group-hover:scale-x-100" />
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <item.icon aria-hidden="true" className="size-3.5" />
            {item.label}
          </dt>
          <dd className="mt-2 text-[30px] font-semibold leading-none tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
