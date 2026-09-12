import {
  AlertTriangle,
  ArrowUpRight,
  CircleDot,
  FileText,
  History,
  MessageSquareQuote,
  Sparkles,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CaseStatus, Priority, Provenance, ReviewState } from "@/features/clinician/types";

/**
 * Status language for the clinical workspace.
 * Every badge pairs an icon + text with color — never color alone.
 */

const base =
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[13px] font-medium leading-5";

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const map = {
    urgent: {
      label: "Urgent",
      icon: AlertTriangle,
      style: "border-destructive/45 bg-destructive/10 text-destructive",
    },
    priority: {
      label: "Priority",
      icon: ArrowUpRight,
      style: "border-primary/40 bg-primary/10 text-primary",
    },
    normal: {
      label: "Normal",
      icon: CircleDot,
      style: "border-border bg-muted text-muted-foreground",
    },
  } as const;
  const { label, icon: Icon, style } = map[priority];
  return (
    <span className={cn(base, style, className)}>
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      {label}
    </span>
  );
}

export function CaseStatusBadge({ status, className }: { status: CaseStatus; className?: string }) {
  const map = {
    waiting: {
      label: "Waiting",
      icon: Clock,
      style: "border-border bg-surface text-muted-foreground",
    },
    ready: {
      label: "Ready for review",
      icon: CheckCircle2,
      style: "border-secondary/40 bg-accent text-accent-foreground",
    },
    "in-progress": {
      label: "In progress",
      icon: Loader2,
      style: "border-primary/30 bg-primary-soft/40 text-foreground",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      style: "border-border bg-muted text-muted-foreground",
    },
  } as const;
  const { label, icon: Icon, style } = map[status];
  return (
    <span className={cn(base, style, className)}>
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      {label}
    </span>
  );
}

export function ReviewStateBadge({ state, className }: { state: ReviewState; className?: string }) {
  const map = {
    "needs-review": {
      label: "Needs review",
      icon: AlertTriangle,
      style: "border-primary/40 bg-primary/10 text-primary",
    },
    reviewed: {
      label: "Reviewed",
      icon: CheckCircle2,
      style: "border-secondary/40 bg-accent text-accent-foreground",
    },
    confirmed: {
      label: "Confirmed",
      icon: CheckCircle2,
      style: "border-secondary/45 bg-accent text-accent-foreground",
    },
    updated: {
      label: "Updated",
      icon: History,
      style: "border-border bg-muted text-muted-foreground",
    },
  } as const;
  const { label, icon: Icon, style } = map[state];
  return (
    <span className={cn(base, style, className)}>
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      {label}
    </span>
  );
}

/** Provenance is the most important signal in this product. Keep it explicit. */
export function ProvenanceChip({
  provenance,
  className,
}: {
  provenance: Provenance;
  className?: string;
}) {
  const map = {
    "patient-response": {
      label: "Patient response",
      icon: MessageSquareQuote,
      style: "border-secondary/40 bg-accent/70 text-accent-foreground",
    },
    "uploaded-document": {
      label: "Uploaded document",
      icon: FileText,
      style: "border-border bg-surface-sunken text-foreground",
    },
    "previous-record": {
      label: "Previous record",
      icon: History,
      style: "border-border bg-surface-sunken text-muted-foreground",
    },
    "ai-draft": {
      label: "AI-assisted draft",
      icon: Sparkles,
      style: "border-primary/40 bg-primary/10 text-primary",
    },
  } as const;
  const { label, icon: Icon, style } = map[provenance];
  return (
    <span className={cn(base, "uppercase tracking-wide", style, className)}>
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      {label}
    </span>
  );
}

export function DemoDataNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Demonstration data. No real patient records are shown.
    </p>
  );
}
