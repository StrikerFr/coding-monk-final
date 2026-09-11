import { CheckCircle2, Clock3, Database, Search } from "lucide-react";
import { useOperations } from "@/features/operations/operations-context";
import { OperationsError, ServiceHealthSkeleton } from "../OperationsStates";
import { OperationsPageHeader } from "../OperationsPageHeader";
import { StatusBadge } from "../StatusBadge";
export function SearchHealthPage() {
  const { searchHealth, loading, error, retryLoad } = useOperations();
  if (error) return <OperationsError onRetry={retryLoad} />;
  return (
    <div>
      <OperationsPageHeader
        title="Search Health"
        description="Monitor synthetic search projection and indexing state."
      />
      {loading ? (
        <ServiceHealthSkeleton />
      ) : (
        searchHealth && (
          <>
            <section className="mt-6 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-4">
              {[
                {
                  label: "Projection status",
                  value: <StatusBadge status={searchHealth.status} />,
                  icon: Search,
                },
                { label: "Indexed", value: `${searchHealth.indexedPercent}%`, icon: Database },
                { label: "Pending", value: String(searchHealth.pending), icon: Clock3 },
                { label: "Failed", value: String(searchHealth.failed), icon: CheckCircle2 },
              ].map((item) => (
                <div key={item.label} className="bg-surface p-5">
                  <item.icon className="size-5 text-secondary" />
                  <p className="mt-4 text-[11px] font-bold uppercase text-muted-foreground">
                    {item.label}
                  </p>
                  <div className="mt-2 text-2xl font-semibold">{item.value}</div>
                </div>
              ))}
            </section>
            <section className="mt-8 max-w-3xl border-y border-border py-6">
              <p className="text-xs font-bold uppercase text-primary">Projection progress</p>
              <h2 className="mt-1 text-xl font-semibold">Clinical search index</h2>
              <div className="mt-5 flex justify-between text-sm">
                <span>Indexed records</span>
                <span className="font-mono">{searchHealth.indexedPercent}%</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className="h-full rounded-full bg-secondary"
                  style={{ width: `${searchHealth.indexedPercent}%` }}
                />
              </div>
              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">Last projection</dt>
                  <dd className="mt-1 font-mono font-semibold">{searchHealth.lastProjection}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Pending projections</dt>
                  <dd className="mt-1 font-mono font-semibold">{searchHealth.pending}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Failed projections</dt>
                  <dd className="mt-1 font-mono font-semibold">{searchHealth.failed}</dd>
                </div>
              </dl>
            </section>
            <p className="mt-5 text-xs text-muted-foreground">
              Synthetic projection state only. No live Elasticsearch or clinical search service is
              connected.
            </p>
          </>
        )
      )}
    </div>
  );
}
