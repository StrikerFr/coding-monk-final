import { ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
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
import type { ReviewCategory, ReviewItem } from "@/features/operations/types";
import { CopyId } from "../CopyId";
import { OperationsEmpty, OperationsError, QueueSkeleton } from "../OperationsStates";
import { OperationsPageHeader } from "../OperationsPageHeader";
import { StatusBadge } from "../StatusBadge";
const categories: Array<"All" | ReviewCategory> = [
  "All",
  "Document",
  "OCR",
  "Extraction",
  "Summary",
  "Other",
];
export function ManualReviewPage() {
  const { reviews, loading, error, retryLoad, markReviewed, returnToQueue } = useOperations();
  const [category, setCategory] = useState<"All" | ReviewCategory>("All");
  const [selected, setSelected] = useState<ReviewItem | null>(null);
  const visible = useMemo(
    () => reviews.filter((i) => category === "All" || i.category === category),
    [reviews, category],
  );
  if (error) return <OperationsError onRetry={retryLoad} />;
  return (
    <div>
      <OperationsPageHeader
        title="Manual Review"
        description="Items that require human verification before processing can continue."
      />
      <div
        className="flex gap-1 overflow-x-auto border-b border-border py-3"
        role="group"
        aria-label="Review categories"
      >
        {categories.map((c) => (
          <Button
            key={c}
            variant="ghost"
            aria-pressed={category === c}
            className={category === c ? "bg-primary/8" : ""}
            onClick={() => setCategory(c)}
          >
            {c}
          </Button>
        ))}
      </div>
      {loading ? (
        <QueueSkeleton />
      ) : visible.length === 0 ? (
        <OperationsEmpty
          title="No items currently require review."
          body="The selected review queue is clear."
        />
      ) : (
        <div className="mt-4 divide-y divide-border border-y border-border">
          {visible.map((item) => (
            <article
              key={item.id}
              className="grid gap-3 py-4 sm:grid-cols-[140px_minmax(220px,1fr)_160px_140px_auto] sm:items-center"
            >
              <CopyId value={item.id} />
              <div>
                <p className="font-semibold">{item.reason}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.category}</p>
              </div>
              <p className="text-sm">{item.source}</p>
              <StatusBadge
                status={
                  item.status === "reviewed"
                    ? "operational"
                    : item.status === "reviewing"
                      ? "processing"
                      : "attention"
                }
              />
              <Button variant="outline" onClick={() => setSelected(item)}>
                Review <ArrowRight />
              </Button>
            </article>
          ))}
        </div>
      )}
      <ReviewDialog
        item={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onReviewed={(id) => {
          markReviewed(id);
          setSelected(null);
        }}
        onReturn={(id) => {
          returnToQueue(id);
          setSelected(null);
        }}
      />
    </div>
  );
}
function ReviewDialog({
  item,
  open,
  onClose,
  onReviewed,
  onReturn,
}: {
  item: ReviewItem | null;
  open: boolean;
  onClose: () => void;
  onReviewed: (id: string) => void;
  onReturn: (id: string) => void;
}) {
  if (!item) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <p className="text-xs font-bold uppercase text-primary">Review item · Demo</p>
          <DialogTitle>{item.id}</DialogTitle>
          <DialogDescription>Processing could not be completed automatically.</DialogDescription>
        </DialogHeader>
        <dl className="divide-y divide-border border-y border-border">
          {[
            ["Reason", item.reason],
            ["Source", item.source],
            ["Status", item.status],
            ["Created", item.createdAt],
            ["Correlation ID", item.correlationId],
          ].map(([l, v]) => (
            <div key={l} className="grid grid-cols-[120px_1fr] gap-3 py-3 text-sm">
              <dt className="text-muted-foreground">{l}</dt>
              <dd className={String(l).includes("ID") ? "font-mono text-xs" : "font-medium"}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onReturn(item.id)}>
            <RotateCcw />
            Return to queue
          </Button>
          <Button onClick={() => onReviewed(item.id)}>
            <CheckCircle2 />
            Mark reviewed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
