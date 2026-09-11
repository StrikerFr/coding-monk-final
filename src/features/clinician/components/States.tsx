import type { ReactNode } from "react";
import { Inbox, RefreshCw, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function WorklistSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-24 rounded-md" />
        </div>
      ))}
      <span className="sr-only">Loading worklist</span>
    </div>
  );
}

export function PatientOverviewSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-48 rounded-xl lg:col-span-2" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

export function DocumentSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true">
      <Skeleton className="h-14 w-full rounded-lg" />
      <Skeleton className="h-14 w-full rounded-lg" />
    </div>
  );
}

export function SummarySkeleton() {
  return (
    <div className="space-y-2" aria-busy="true">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-9/12" />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon = "inbox",
  action,
  className,
}: {
  title: string;
  description: string;
  icon?: "inbox" | "clear";
  action?: ReactNode;
  className?: string;
}) {
  const Icon = icon === "clear" ? ShieldCheck : Inbox;
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-14 text-center", className)}>
      <span className="flex size-11 items-center justify-center rounded-full border border-border bg-surface-sunken">
        <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
      </span>
      <div>
        <p className="text-base font-semibold">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong.",
  description = "Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex size-11 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10">
        <TriangleAlert aria-hidden="true" className="size-5 text-destructive" />
      </span>
      <div>
        <p className="text-base font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw aria-hidden="true" className="size-4" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
