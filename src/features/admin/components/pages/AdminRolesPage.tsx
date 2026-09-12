import { useState } from "react";
import { Check, Minus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdmin } from "@/features/admin/admin-context";
import type { AdminRole } from "@/features/admin/types";
import { AdminEmpty, AdminError, RolesSkeleton } from "../AdminStates";
import { AdminPageHeader } from "../AdminPrimitives";
function Mark({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <span className="inline-flex items-center gap-1 font-semibold text-accent-foreground">
      <Check className="size-4" />
      Enabled
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <Minus className="size-4" />
      Not assigned
    </span>
  );
}
export function AdminRolesPage() {
  const { roles, loading, error, retryLoad } = useAdmin();
  const [selected, setSelected] = useState<AdminRole | null>(null);
  if (error) return <AdminError onRetry={retryLoad} />;
  return (
    <>
      <AdminPageHeader
        title="Roles & Permissions"
        description="Control access through predefined administrative roles."
      />
      {loading ? (
        <RolesSkeleton />
      ) : roles.length === 0 ? (
        <AdminEmpty title="No roles found." />
      ) : (
        <div className="grid gap-7 xl:grid-cols-[20rem_1fr]">
          <div className="divide-y divide-border border-y border-border">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelected(role)}
                className="flex min-h-20 w-full items-center gap-3 px-3 text-left hover:bg-surface-sunken"
              >
                <span className="flex size-10 items-center justify-center rounded-md bg-primary/8 text-primary">
                  <ShieldCheck className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{role.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {role.userCount} synthetic assignments
                  </span>
                </span>
                <span className="text-xs font-semibold text-primary">Inspect</span>
              </button>
            ))}
          </div>
          <div>
            <div className="mb-3">
              <h2 className="text-lg font-semibold">Illustrative permission matrix</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Predefined categories only. The future backend will enforce authorization.
              </p>
            </div>
            <div className="hidden overflow-hidden border-y border-border md:block">
              <table className="w-full text-left">
                <thead className="bg-surface-sunken text-[11px] uppercase text-muted-foreground">
                  <tr>
                    {["Workspace", "View", "Create", "Edit", "Admin"].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {roles[0]?.permissions.map((row) => (
                    <tr key={row.category}>
                      <th scope="row" className="px-4 py-3 text-sm font-medium">
                        {row.category}
                      </th>
                      {[row.view, row.create, row.edit, row.admin].map((v, i) => (
                        <td key={i} className="px-4 py-3">
                          {v ? (
                            <Check className="size-4 text-secondary" aria-label="Enabled" />
                          ) : (
                            <Minus
                              className="size-4 text-muted-foreground"
                              aria-label="Not assigned"
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Shown permissions are demo examples and are not a final production authorization
              policy.
            </p>
          </div>
        </div>
      )}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>{selected?.description}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Permissions</p>
              <ul className="mt-2 divide-y divide-border border-y border-border">
                {selected.permissions.map((permission) => (
                  <li
                    key={permission.category}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <span className="font-medium">{permission.category}</span>
                    <Mark
                      enabled={
                        permission.view || permission.create || permission.edit || permission.admin
                      }
                    />
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-md bg-muted p-4 text-sm text-muted-foreground">
                This role is predefined. Arbitrary permissions cannot be created in this
                demonstration.
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
