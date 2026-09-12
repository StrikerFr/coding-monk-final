import { History, Play } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOperations } from "@/features/operations/operations-context";
import type { ReplayRecord } from "@/features/operations/types";
import { CopyId } from "../CopyId";
import { EventTableSkeleton, OperationsEmpty, OperationsError } from "../OperationsStates";
import { OperationsPageHeader } from "../OperationsPageHeader";
import { StatusBadge } from "../StatusBadge";
export function ReplayPage() {
  const { replays, loading, error, retryLoad, replayEvent } = useOperations();
  const [selected, setSelected] = useState<ReplayRecord | null>(null);
  if (error) return <OperationsError onRetry={retryLoad} />;
  return (
    <div>
      <OperationsPageHeader
        title="Audited Replay"
        description="Review and queue controlled event replays in this frontend demonstration."
      />
      {loading ? (
        <EventTableSkeleton />
      ) : replays.length === 0 ? (
        <OperationsEmpty
          title="No replay requests."
          body="Audited replay history will appear here."
        />
      ) : (
        <div className="mt-6">
          <div className="hidden grid-cols-[110px_minmax(190px,1fr)_150px_120px_150px_auto] gap-3 border-y border-border px-3 py-2 text-[11px] font-bold uppercase text-muted-foreground lg:grid">
            <span>Replay ID</span>
            <span>Event</span>
            <span>Event ID</span>
            <span>Status</span>
            <span>Requested by</span>
            <span>Action</span>
          </div>
          <div className="divide-y divide-border">
            {replays.map((item) => (
              <article
                key={item.id}
                className="grid gap-3 py-4 lg:grid-cols-[110px_minmax(190px,1fr)_150px_120px_150px_auto] lg:items-center lg:px-3"
              >
                <CopyId value={item.id} />
                <div>
                  <p className="font-mono text-sm font-semibold">{item.event}</p>
                  <p className="text-xs text-muted-foreground">{item.createdAt}</p>
                </div>
                <CopyId value={item.eventId} />
                <StatusBadge
                  status={
                    item.status === "completed"
                      ? "operational"
                      : item.status === "queued"
                        ? "processing"
                        : "paused"
                  }
                />
                <p className="text-sm">{item.requestedBy}</p>
                <Button
                  variant="outline"
                  disabled={item.status === "queued"}
                  onClick={() => setSelected(item)}
                >
                  <History />
                  Replay
                </Button>
              </article>
            ))}
          </div>
        </div>
      )}
      <p className="mt-5 text-xs text-muted-foreground">
        Actions are recorded in local synthetic audit state and do not reach a backend.
      </p>
      {selected && (
        <Dialog open onOpenChange={(v) => !v && setSelected(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Queue audited replay?</DialogTitle>
              <DialogDescription>
                This changes only the frontend demo state for {selected.eventId}.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md border border-primary/20 bg-primary/5 p-4 text-sm">
              <strong>Safeguard:</strong> This demonstration performs no event publication or
              infrastructure action.
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await replayEvent(selected.id);
                  setSelected(null);
                }}
              >
                <Play />
                Queue replay
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
