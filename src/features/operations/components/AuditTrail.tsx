import { History } from "lucide-react";
import type { AuditEntry } from "@/features/operations/types";
export function AuditTrail({ items }: { items: AuditEntry[] }) {
  return (
    <section aria-labelledby="audit-title">
      <div className="flex items-center gap-2">
        <History className="size-4 text-primary" />
        <p className="text-xs font-bold uppercase text-muted-foreground">Audit trail</p>
      </div>
      <h2 id="audit-title" className="mt-1 text-xl font-semibold">
        Recent operational activity
      </h2>
      <ol className="mt-4 divide-y divide-border border-y border-border">
        {items.map((item) => (
          <li key={item.id} className="grid grid-cols-[72px_1fr] gap-3 py-3 text-sm">
            <time className="font-mono text-xs text-muted-foreground">{item.time}</time>
            <span>
              <strong>{item.actor}</strong> {item.action}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-muted-foreground">
        Synthetic audit entries for interface demonstration only.
      </p>
    </section>
  );
}
