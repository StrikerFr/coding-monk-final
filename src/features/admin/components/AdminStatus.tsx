import { CheckCircle2, Clock3, PauseCircle, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
export function AdminStatus({ status }: { status: string }) {
  const isActive = status === "Active" || status === "Complete" || status === "Completed";
  const isPending = status === "Pending" || status === "Attention" || status === "Incomplete";
  const Icon = isActive ? CheckCircle2 : isPending ? Clock3 : PauseCircle;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-1 text-xs font-semibold",
        isActive
          ? "border-secondary/25 bg-accent text-accent-foreground"
          : isPending
            ? "border-primary/25 bg-primary/8 text-primary"
            : "border-border bg-muted text-muted-foreground",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {status}
    </span>
  );
}
export function DemoNotice() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/25 bg-primary/8 px-2 py-1 text-[10px] font-bold uppercase text-primary">
      <TriangleAlert className="size-3" />
      Demo environment
    </span>
  );
}
