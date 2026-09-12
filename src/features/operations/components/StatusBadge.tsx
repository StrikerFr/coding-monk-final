import { AlertTriangle, CheckCircle2, CirclePause, LoaderCircle, OctagonX } from "lucide-react";
import type { OpsStatus, Priority } from "@/features/operations/types";
import { cn } from "@/lib/utils";
const map = {
  operational: {
    label: "Operational",
    icon: CheckCircle2,
    cls: "text-accent-foreground border-secondary/30 bg-accent",
  },
  degraded: {
    label: "Degraded",
    icon: AlertTriangle,
    cls: "text-primary border-primary/30 bg-primary/10",
  },
  attention: {
    label: "Attention",
    icon: AlertTriangle,
    cls: "text-primary border-primary/30 bg-primary/10",
  },
  failed: {
    label: "Failed",
    icon: OctagonX,
    cls: "text-destructive border-destructive/30 bg-destructive/10",
  },
  paused: {
    label: "Paused",
    icon: CirclePause,
    cls: "text-muted-foreground border-border bg-muted",
  },
  processing: {
    label: "Processing",
    icon: LoaderCircle,
    cls: "text-foreground border-border bg-surface-sunken",
  },
} as const;
export function StatusBadge({ status }: { status: OpsStatus }) {
  const item = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        item.cls,
      )}
    >
      <item.icon
        className={cn("size-3.5", status === "processing" && "motion-safe:animate-spin")}
        aria-hidden="true"
      />
      {item.label}
    </span>
  );
}
const priorities: Record<Priority, string> = {
  critical: "border-destructive/40 bg-destructive/10 text-destructive",
  high: "border-primary/40 bg-primary/10 text-primary",
  medium: "border-border bg-surface-sunken text-foreground",
  low: "border-border bg-surface text-muted-foreground",
};
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "rounded-sm border px-2 py-1 text-[11px] font-bold uppercase",
        priorities[priority],
      )}
    >
      {priority}
    </span>
  );
}
