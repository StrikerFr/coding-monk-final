import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CirclePause,
  FileScan,
  Search,
  Send,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useOperations } from "@/features/operations/operations-context";
import { AuditTrail } from "../AuditTrail";
import {
  OperationsError,
  PipelineSkeleton,
  QueueSkeleton,
  ServiceHealthSkeleton,
} from "../OperationsStates";
import { OperationsPageHeader } from "../OperationsPageHeader";
import { PriorityBadge, StatusBadge } from "../StatusBadge";
const area = [
  {
    label: "Document processing",
    state: "Operational",
    detail: "18 processing · 2 manual review",
    icon: FileScan,
  },
  { label: "Event pipeline", state: "Operational", detail: "4 pending · 0 failed", icon: Send },
  { label: "Search index", state: "Operational", detail: "98% indexed", icon: Search },
  { label: "Notifications", state: "Operational", detail: "3 queued", icon: CheckCircle2 },
];
export function OperationsOverviewPage() {
  const { overview, audit, loading, error, retryLoad } = useOperations();
  if (error) return <OperationsError onRetry={retryLoad} />;
  return (
    <div>
      <OperationsPageHeader
        title="Operations Overview"
        description="Monitor processing, event delivery, and system health."
      />
      <section
        aria-labelledby="system-title"
        className="grid border-b border-border py-5 lg:grid-cols-[1.2fr_.8fr_.8fr_.8fr]"
      >
        <div className="pb-4 lg:pb-0">
          <p id="system-title" className="text-[11px] font-bold uppercase text-muted-foreground">
            System status
          </p>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status="operational" />
            <span className="rounded-sm border border-primary/25 bg-primary/8 px-2 py-1 text-[10px] font-bold uppercase text-primary">
              Demo environment
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Last checked{" "}
            <span className="font-mono text-foreground">{overview?.checkedAt ?? "—"}</span>
          </p>
        </div>
        {[
          {
            label: "Operational",
            value: overview?.services.filter((s) => s.status === "operational").length ?? 0,
            icon: CheckCircle2,
          },
          {
            label: "Attention",
            value:
              overview?.services.filter((s) => s.status === "attention" || s.status === "degraded")
                .length ?? 0,
            icon: AlertTriangle,
          },
          {
            label: "Unavailable",
            value: overview?.services.filter((s) => s.status === "failed").length ?? 0,
            icon: CirclePause,
          },
        ].map((item, i) => (
          <div
            key={item.label}
            className="flex min-h-20 items-center gap-3 border-t border-border py-3 lg:border-l lg:border-t-0 lg:px-5"
          >
            <item.icon
              className={`size-5 ${i === 0 ? "text-secondary" : i === 1 ? "text-primary" : "text-muted-foreground"}`}
            />
            <div>
              <p className="text-2xl font-semibold tabular-nums">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        ))}
      </section>
      <section
        aria-label="Primary health areas"
        className="grid border-b border-border sm:grid-cols-2 xl:grid-cols-4"
      >
        {area.map((item, i) => (
          <div
            key={item.label}
            className={`flex min-h-24 items-center gap-3 py-4 sm:px-4 ${i > 0 ? "border-t border-border sm:border-l sm:border-t-0" : ""}`}
          >
            <item.icon className="size-5 text-secondary" />
            <div>
              <p className="text-[11px] font-bold uppercase text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-sm font-semibold">{item.state}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
            </div>
          </div>
        ))}
      </section>
      <section aria-labelledby="attention-title" className="mt-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-primary">Needs attention</p>
            <h2 id="attention-title" className="mt-1 text-[22px] font-semibold">
              Operational items to inspect
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">Synthetic queue</span>
        </div>
        {loading ? (
          <QueueSkeleton />
        ) : (
          <div className="mt-4 divide-y divide-border border-y border-border">
            {overview?.attention.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(150px,.8fr)_120px_auto] sm:items-center"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-4 text-primary" />
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="font-mono text-xs text-muted-foreground">{item.id}</p>
                  </div>
                </div>
                <p className="text-sm">{item.subject}</p>
                <div>
                  <PriorityBadge priority={item.priority} />
                  <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link
                    to={
                      item.kind === "dlq"
                        ? "/operations/dlq"
                        : item.kind === "outbox"
                          ? "/operations/outbox"
                          : "/operations/manual-review"
                    }
                  >
                    Inspect <ArrowRight />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
      <section aria-labelledby="processing-title" className="mt-8 border-t border-border pt-7">
        <p className="text-xs font-bold uppercase text-muted-foreground">Active processing</p>
        <h2 id="processing-title" className="mt-1 text-[22px] font-semibold">
          Current synthetic workloads
        </h2>
        <div className="mt-4 grid gap-x-8 gap-y-5 md:grid-cols-2">
          {overview?.processing.map((job) => (
            <div key={job.id}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold">{job.label}</span>
                <span className="font-mono text-xs">{job.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className="h-full rounded-full bg-secondary transition-[width] duration-700 motion-reduce:transition-none"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Demo progress</p>
            </div>
          ))}
        </div>
      </section>
      <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.55fr)]">
        <section aria-labelledby="services-title">
          <p className="text-xs font-bold uppercase text-muted-foreground">Service health</p>
          <h2 id="services-title" className="mt-1 text-[22px] font-semibold">
            Useful operational state
          </h2>
          {loading ? (
            <ServiceHealthSkeleton />
          ) : (
            <div className="mt-4">
              <div className="hidden grid-cols-[minmax(200px,1fr)_150px_80px_60px] gap-3 border-y border-border px-3 py-2 text-[11px] font-bold uppercase text-muted-foreground md:grid">
                <span>Service</span>
                <span>Status</span>
                <span>Latency</span>
                <span>Queue</span>
              </div>
              <div className="divide-y divide-border">
                {overview?.services.map((service) => (
                  <div
                    key={service.id}
                    className="grid gap-2 py-3 md:grid-cols-[minmax(200px,1fr)_150px_80px_60px] md:items-center md:px-3"
                  >
                    <span className="text-sm font-semibold">{service.name}</span>
                    <StatusBadge status={service.status} />
                    <span className="text-xs text-muted-foreground">
                      Latency <span className="font-mono text-foreground">{service.latency}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Queue{" "}
                      <span className="font-mono text-foreground">{service.queue ?? "—"}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
        <AuditTrail items={audit} />
      </div>
      <section aria-labelledby="pipeline-title" className="mt-10 border-t border-border pt-7">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-primary">Document processing</p>
            <h2 id="pipeline-title" className="mt-1 text-[22px] font-semibold">
              Document pipeline
            </h2>
          </div>
          <span className="rounded-sm border border-border px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">
            Demo data
          </span>
        </div>
        {loading ? (
          <PipelineSkeleton />
        ) : (
          <div className="mt-5 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-4 xl:grid-cols-7">
            {overview?.pipeline.map((stage, i) => (
              <div key={stage.id} className="relative bg-surface p-4">
                <p className="text-[11px] font-bold uppercase text-muted-foreground">
                  {stage.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">{stage.count}</p>
                <StatusBadge status={stage.status} />
                {i < 6 && (
                  <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden size-5 rounded-full bg-background p-1 text-muted-foreground xl:block" />
                )}
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Counts are synthetic. Clinical records remain separate from operational transport and
          projections.
        </p>
      </section>
    </div>
  );
}
