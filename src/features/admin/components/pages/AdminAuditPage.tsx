import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdmin } from "@/features/admin/admin-context";
import type { AuditEvent } from "@/features/admin/types";
import { AdminEmpty, AdminError, AuditSkeleton } from "../AdminStates";
import { AdminPageHeader, SearchField } from "../AdminPrimitives";
import { AdminStatus } from "../AdminStatus";
export function AdminAuditPage() {
  const { audit, loading, error, retryLoad } = useAdmin();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const shown = useMemo(
    () =>
      audit.filter((e) =>
        `${e.actor} ${e.action} ${e.target}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [audit, query],
  );
  if (error) return <AdminError onRetry={retryLoad} />;
  return (
    <>
      <AdminPageHeader
        title="Audit Log"
        description="Review administrative actions and access changes."
      />
      <div className="mb-5 max-w-xl">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search by actor, action, or target"
        />
      </div>
      {loading ? (
        <AuditSkeleton />
      ) : shown.length === 0 ? (
        <AdminEmpty title="No administrative activity found." />
      ) : (
        <>
          <div className="hidden border-y border-border md:block">
            <table className="w-full text-left">
              <thead className="bg-surface-sunken text-[11px] uppercase text-muted-foreground">
                <tr>
                  {["Time", "Actor", "Action", "Target", "Status", "Detail"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shown.map((e) => (
                  <tr key={e.id} className="hover:bg-surface/70">
                    <td className="px-4 py-4 text-sm tabular-nums text-muted-foreground">
                      {e.timestamp}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium">{e.actor}</td>
                    <td className="px-4 py-4 text-sm">{e.action}</td>
                    <td className="px-4 py-4 text-sm font-mono">{e.target}</td>
                    <td className="px-4 py-4">
                      <AdminStatus status={e.status} />
                    </td>
                    <td className="px-4 py-4">
                      <Button variant="outline" onClick={() => setSelected(e)}>
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ol className="divide-y divide-border border-y border-border md:hidden">
            {shown.map((e) => (
              <li key={e.id} className="py-4">
                <button
                  onClick={() => setSelected(e)}
                  className="w-full rounded-md p-2 text-left hover:bg-surface-sunken"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-semibold">{e.action}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {e.timestamp} · {e.actor}
                      </p>
                      <p className="mt-2 font-mono text-xs">{e.target}</p>
                    </div>
                    <AdminStatus status={e.status} />
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audit Event</DialogTitle>
            <DialogDescription>
              Administrative audit records are read-only in this workspace.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <dl className="divide-y divide-border border-y border-border">
              {[
                ["Audit ID", selected.id],
                ["Actor", selected.actor],
                ["Action", selected.action],
                ["Target", selected.target],
                ["Timestamp", selected.timestamp],
                ["Result", selected.status],
                ["Correlation ID", selected.correlationId],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[8rem_1fr] gap-3 py-3 text-sm">
                  <dt className="font-medium text-muted-foreground">{k}</dt>
                  <dd className="break-all font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="text-xs text-muted-foreground">
            Sensitive payloads are intentionally not displayed.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
