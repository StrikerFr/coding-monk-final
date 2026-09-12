import { Inbox, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
export function AdminTableSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading administrative data" className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
export const UsersSkeleton = AdminTableSkeleton;
export const RolesSkeleton = AdminTableSkeleton;
export const FacilitiesSkeleton = AdminTableSkeleton;
export const AuditSkeleton = AdminTableSkeleton;
export function ConfigurationSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  );
}
export function AdminEmpty({ title }: { title: string }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center text-center">
      <Inbox className="size-7 text-secondary" />
      <h2 className="mt-3 font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Adjust your search or filter and try again.
      </p>
    </div>
  );
}
export function AdminError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex min-h-72 flex-col items-center justify-center text-center">
      <TriangleAlert className="size-7 text-primary" />
      <h2 className="mt-3 text-xl font-semibold">Unable to load administrative data.</h2>
      <p className="mt-1 text-sm text-muted-foreground">This is a demo environment.</p>
      <Button className="mt-5 min-h-11" onClick={onRetry}>
        <RefreshCw />
        Retry
      </Button>
    </div>
  );
}
