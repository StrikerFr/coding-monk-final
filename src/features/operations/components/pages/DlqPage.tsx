import { ArrowRight, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useOperations } from "@/features/operations/operations-context";
import type { DlqEvent } from "@/features/operations/types";
import { CopyId } from "../CopyId";
import { EventDetailDialog } from "../EventDetailDialog";
import { OperationsFilters } from "../Filters";
import { EventTableSkeleton, OperationsEmpty, OperationsError } from "../OperationsStates";
import { OperationsPageHeader } from "../OperationsPageHeader";
import { PriorityBadge, StatusBadge } from "../StatusBadge";
export function DlqPage() {
  const { dlq, loading, error, retryLoad, retryEvent, moveToReview } = useOperations();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [service, setService] = useState("all");
  const [type, setType] = useState("all");
  const [selected, setSelected] = useState<DlqEvent | null>(null);
  const visible = useMemo(
    () =>
      dlq.filter(
        (item) =>
          (status === "all" || item.status === status) &&
          (service === "all" || item.service === service) &&
          (type === "all" || item.type === type) &&
          `${item.id} ${item.type} ${item.service}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [dlq, search, status, service, type],
  );
  if (error) return <OperationsError onRetry={retryLoad} />;
  return (
    <div>
      <OperationsPageHeader
        title="Dead Letter Queue"
        description="Failed events requiring investigation or retry."
      />
      <OperationsFilters
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
        service={service}
        onService={setService}
        type={type}
        onType={setType}
        services={[...new Set(dlq.map((i) => i.service))]}
        types={[...new Set(dlq.map((i) => i.type))]}
      />
      {loading ? (
        <EventTableSkeleton />
      ) : visible.length === 0 ? (
        <OperationsEmpty
          title="Dead letter queue is clear."
          body="No failed events require attention."
        />
      ) : (
        <div className="mt-4">
          <div className="hidden grid-cols-[110px_minmax(180px,1fr)_minmax(160px,.8fr)_100px_70px_110px_110px] gap-3 border-y border-border px-3 py-2 text-[11px] font-bold uppercase text-muted-foreground lg:grid">
            <span>ID</span>
            <span>Type</span>
            <span>Service</span>
            <span>Failed</span>
            <span>Retries</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          <div className="divide-y divide-border">
            {visible.map((item) => (
              <article
                key={item.id}
                className="grid gap-3 py-4 hover:bg-surface-sunken/50 lg:grid-cols-[110px_minmax(180px,1fr)_minmax(160px,.8fr)_100px_70px_110px_110px] lg:items-center lg:px-3"
              >
                <CopyId value={item.id} />
                <div>
                  <p className="font-mono text-sm font-semibold">{item.type}</p>
                  <PriorityBadge priority={item.priority} />
                </div>
                <p className="font-mono text-xs text-muted-foreground">{item.service}</p>
                <time className="text-sm">{item.failedAt}</time>
                <span className="font-mono text-sm">{item.retries}</span>
                <StatusBadge status={item.status === "review" ? "attention" : item.status} />
                <Button variant="outline" size="sm" onClick={() => setSelected(item)}>
                  Inspect <ArrowRight />
                </Button>
              </article>
            ))}
          </div>
        </div>
      )}
      <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
        <RotateCcw className="size-3.5" />
        Retries only change this frontend demonstration.
      </div>
      <EventDetailDialog
        event={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        onRetry={async (id) => {
          await retryEvent(id);
          setSelected(null);
        }}
        onReview={(id) => {
          moveToReview(id);
          setSelected(null);
        }}
      />
    </div>
  );
}
