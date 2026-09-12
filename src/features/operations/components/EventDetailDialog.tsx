import { ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DlqEvent } from "@/features/operations/types";
import { CopyId } from "./CopyId";
import { StatusBadge } from "./StatusBadge";
export function EventDetailDialog({
  event,
  open,
  onOpenChange,
  onRetry,
  onReview,
}: {
  event: DlqEvent | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRetry: (id: string) => void;
  onReview: (id: string) => void;
}) {
  if (!event) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <p className="text-xs font-bold uppercase text-primary">Event details · Demo</p>
          <DialogTitle>{event.id}</DialogTitle>
          <DialogDescription>
            Operational metadata only. No patient information is shown.
          </DialogDescription>
        </DialogHeader>
        <dl className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
          {[
            ["Event ID", <CopyId value={event.id} />],
            ["Event Type", event.type],
            ["Source", event.service],
            ["Created", event.failedAt],
            ["Retry count", String(event.retries)],
            [
              "Status",
              <StatusBadge status={event.status === "review" ? "attention" : event.status} />,
            ],
            ["Correlation ID", <CopyId value={event.correlationId} />],
            ["Job ID", <CopyId value={event.jobId} />],
          ].map(([label, value]) => (
            <div key={String(label)} className="bg-surface p-3">
              <dt className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <div>
          <h3 className="text-sm font-semibold">Payload preview</h3>
          <pre className="mt-2 overflow-auto rounded-md border border-border bg-surface-sunken p-4 font-mono text-xs leading-relaxed">
            {JSON.stringify(event.payload, null, 2)}
          </pre>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onReview(event.id)}>
            Move to review <ArrowRight />
          </Button>
          <Button onClick={() => onRetry(event.id)}>
            <RotateCcw />
            Retry in demo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
