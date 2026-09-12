import { CheckCircle2, CircleDot, Clock3, Send } from "lucide-react";
import type { AssistedQueueStatus } from "@/features/assisted-kiosk/types";
import { cn } from "@/lib/utils";
const details = {
  waiting: {
    label: "Waiting",
    icon: Clock3,
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  "in-progress": {
    label: "In progress",
    icon: CircleDot,
    className: "border-foreground/20 bg-muted text-foreground",
  },
  ready: {
    label: "Ready for handoff",
    icon: Send,
    className: "border-secondary/30 bg-accent text-accent-foreground",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "border-border bg-surface-sunken text-muted-foreground",
  },
} as const;
export function QueueStatus({
  status,
  compact = false,
  className,
}: {
  status: AssistedQueueStatus;
  compact?: boolean;
  className?: string;
}) {
  const item = details[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        item.className,
        className,
      )}
    >
      <item.icon className="size-3.5" aria-hidden="true" />
      {compact && status === "ready" ? "Ready" : item.label}
    </span>
  );
}
