import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Turso stores timestamps as UTC "YYYY-MM-DD HH:MM:SS". */
export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function minutesSince(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
}

export function StaffPageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  stats,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  stats: Array<{ label: string; value: string | number }>;
}) {
  return (
    <Card className="border-border bg-surface">
      <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft/60 text-primary">
            <Icon className="size-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{title}</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:shrink-0">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-background px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 text-xl font-semibold">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

export function StaffLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <Card key={index} className="border-border">
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function StaffEmpty({ title, body }: { title: string; body: string }) {
  return (
    <Card className="border-dashed border-border">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-sunken text-muted-foreground">
          <Inbox className="size-6" />
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}

export function StaffError({ message }: { message: string }) {
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardContent className="flex items-start gap-3 p-5">
        <AlertCircle className="mt-0.5 size-5 text-destructive" />
        <div>
          <p className="font-medium">We could not load this right now.</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    "in-progress": { label: "In progress", variant: "default" },
    "ready-for-review": { label: "Ready for clinician", variant: "secondary" },
    completed: { label: "Completed", variant: "outline" },
  };
  const item = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
