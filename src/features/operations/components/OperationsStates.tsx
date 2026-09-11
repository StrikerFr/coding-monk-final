import { Inbox, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
export function ServiceHealthSkeleton() {
  return (
    <div aria-busy="true" className="space-y-1">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="grid grid-cols-[1.5fr_.7fr_.4fr] gap-4 border-b border-border p-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  );
}
export function QueueSkeleton() {
  return (
    <div aria-busy="true" className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
export const EventTableSkeleton = QueueSkeleton;
export const PipelineSkeleton = QueueSkeleton;
export function OperationsEmpty({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center text-center">
      <Inbox className="size-6 text-secondary" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
export function OperationsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex min-h-64 flex-col items-center justify-center text-center">
      <TriangleAlert className="size-7 text-primary" />
      <h2 className="mt-3 text-xl font-semibold">Unable to load operational data.</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This is a demo environment, so try again.
      </p>
      <Button className="mt-5 min-h-11" onClick={onRetry}>
        <RefreshCw />
        Retry
      </Button>
    </div>
  );
}
