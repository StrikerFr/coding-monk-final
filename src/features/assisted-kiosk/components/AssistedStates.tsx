import { Inbox, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
export function QueueSkeleton() {
  return (
    <div
      className="divide-y divide-border border-y border-border"
      aria-busy="true"
      aria-label="Loading patient queue"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid min-h-20 grid-cols-[1.4fr_.7fr_.5fr_.7fr_auto] items-center gap-4 px-4"
        >
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-11 w-28" />
        </div>
      ))}
    </div>
  );
}
export function PatientPreviewSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-16 w-full" />
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
export function QueueEmpty({
  title = "No patients waiting",
  description = "Your queue is clear.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center px-4 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-accent">
        <Inbox className="size-5 text-accent-foreground" />
      </span>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
export function QueueError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex min-h-52 flex-col items-center justify-center px-4 text-center"
    >
      <TriangleAlert className="size-6 text-destructive" />
      <h3 className="mt-3 font-semibold">Something went wrong.</h3>
      <p className="mt-1 text-sm text-muted-foreground">Please try again.</p>
      <Button variant="outline" className="mt-4 min-h-12" onClick={onRetry}>
        <RefreshCw />
        Try again
      </Button>
    </div>
  );
}
