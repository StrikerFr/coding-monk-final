import { useMemo, useState } from "react";
import { useOperations } from "@/features/operations/operations-context";
import { CopyId } from "../CopyId";
import { OperationsFilters } from "../Filters";
import { EventTableSkeleton, OperationsEmpty, OperationsError } from "../OperationsStates";
import { OperationsPageHeader } from "../OperationsPageHeader";
import { StatusBadge } from "../StatusBadge";
export function OutboxPage() {
  const { outbox, loading, error, retryLoad } = useOperations();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const visible = useMemo(
    () =>
      outbox.filter(
        (i) =>
          (status === "all" || i.status === status) &&
          `${i.id} ${i.event} ${i.source}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [outbox, search, status],
  );
  if (error) return <OperationsError onRetry={retryLoad} />;
  return (
    <div>
      <OperationsPageHeader
        title="Outbox Health"
        description="Inspect synthetic event publication and delivery state."
      />
      <OperationsFilters
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
      />
      {loading ? (
        <EventTableSkeleton />
      ) : visible.length === 0 ? (
        <OperationsEmpty title="No outbox events found." body="Try a different filter." />
      ) : (
        <div className="mt-4">
          <div className="hidden grid-cols-[130px_minmax(190px,1fr)_minmax(170px,.8fr)_100px_100px_80px] gap-3 border-y border-border px-3 py-2 text-[11px] font-bold uppercase text-muted-foreground lg:grid">
            <span>ID</span>
            <span>Event</span>
            <span>Source</span>
            <span>Created</span>
            <span>Status</span>
            <span>Age</span>
          </div>
          <div className="divide-y divide-border">
            {visible.map((item) => (
              <article
                key={item.id}
                className="grid gap-3 py-4 lg:grid-cols-[130px_minmax(190px,1fr)_minmax(170px,.8fr)_100px_100px_80px] lg:items-center lg:px-3"
              >
                <CopyId value={item.id} />
                <p className="font-mono text-sm font-semibold">{item.event}</p>
                <p className="font-mono text-xs text-muted-foreground">{item.source}</p>
                <time className="text-sm">{item.createdAt}</time>
                <StatusBadge
                  status={
                    item.status === "published"
                      ? "operational"
                      : item.status === "failed"
                        ? "failed"
                        : "processing"
                  }
                />
                <span className="text-sm">{item.age}</span>
              </article>
            ))}
          </div>
        </div>
      )}
      <p className="mt-5 text-xs text-muted-foreground">
        This view does not publish events. All records are synthetic.
      </p>
    </div>
  );
}
