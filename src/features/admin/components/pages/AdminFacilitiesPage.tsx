import { useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAdmin } from "@/features/admin/admin-context";
import type { AdminFacility } from "@/features/admin/types";
import { AdminEmpty, AdminError, FacilitiesSkeleton } from "../AdminStates";
import { AdminPageHeader, DemoFeedback, SearchField } from "../AdminPrimitives";
import { AdminStatus } from "../AdminStatus";
export function AdminFacilitiesPage() {
  const { facilities, loading, error, retryLoad, updateFacility } = useAdmin();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminFacility | null>(null);
  const [message, setMessage] = useState("");
  const shown = useMemo(
    () => facilities.filter((f) => `${f.name} ${f.id}`.toLowerCase().includes(query.toLowerCase())),
    [facilities, query],
  );
  if (error) return <AdminError onRetry={retryLoad} />;
  const change = (key: keyof AdminFacility["settings"], value: boolean | string) => {
    if (!selected) return;
    const settings = { ...selected.settings, [key]: value };
    updateFacility(selected.id, { [key]: value });
    setSelected({ ...selected, settings });
    setMessage("Facility setting updated in demo mode.");
  };
  return (
    <>
      <AdminPageHeader
        title="Facilities"
        description="Manage participating healthcare facilities."
      />
      <div className="mb-5 max-w-xl">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search by facility name or facility ID"
        />
      </div>
      {message && (
        <div className="mb-4">
          <DemoFeedback message={message} />
        </div>
      )}
      {loading ? (
        <FacilitiesSkeleton />
      ) : shown.length === 0 ? (
        <AdminEmpty title="No facilities match your search." />
      ) : (
        <>
          <div className="hidden border-y border-border md:block">
            <table className="w-full text-left">
              <thead className="bg-surface-sunken text-[11px] uppercase text-muted-foreground">
                <tr>
                  {["Facility", "Status", "Users", "Configuration", "Last updated", "Action"].map(
                    (h) => (
                      <th key={h} className="px-4 py-3 font-semibold">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shown.map((f) => (
                  <tr key={f.id} className="hover:bg-surface/70">
                    <td className="px-4 py-4">
                      <p className="font-semibold">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.id}</p>
                    </td>
                    <td className="px-4 py-4">
                      <AdminStatus status={f.status} />
                    </td>
                    <td className="px-4 py-4 text-sm tabular-nums">{f.userCount}</td>
                    <td className="px-4 py-4">
                      <AdminStatus status={f.configurationStatus} />
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{f.lastUpdated}</td>
                    <td className="px-4 py-4">
                      <Button variant="outline" onClick={() => setSelected(f)}>
                        {f.configurationStatus === "Incomplete" ? "Review" : "View"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-border border-y border-border md:hidden">
            {shown.map((f) => (
              <li key={f.id} className="py-4">
                <button
                  onClick={() => setSelected(f)}
                  className="w-full rounded-md p-2 text-left hover:bg-surface-sunken"
                >
                  <div className="flex gap-3">
                    <Building2 className="mt-1 size-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-semibold">{f.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.id} · {f.userCount} users
                      </p>
                      <div className="mt-3 flex gap-2">
                        <AdminStatus status={f.status} />
                        <AdminStatus status={f.configurationStatus} />
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
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
            <DialogDescription>
              Mock facility configuration. No production system is connected.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <dl className="grid gap-4 border-y border-border py-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Facility ID</dt>
                  <dd className="mt-1 font-semibold">{selected.id}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Users</dt>
                  <dd className="mt-1 font-semibold">{selected.userCount}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <AdminStatus status={selected.status} />
                  </dd>
                </div>
              </dl>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Default language
                  <Select
                    value={selected.settings.defaultLanguage}
                    onValueChange={(v) => change("defaultLanguage", v)}
                  >
                    <SelectTrigger className="mt-1 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label className="text-sm font-medium">
                  Secondary language
                  <Select
                    value={selected.settings.secondaryLanguage}
                    onValueChange={(v) => change("secondaryLanguage", v)}
                  >
                    <SelectTrigger className="mt-1 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>
              <div className="divide-y divide-border border-y border-border">
                {[
                  ["Accessibility defaults", "accessibilityDefaults"],
                  ["Assisted kiosk", "assistedKiosk"],
                  ["Patient kiosk", "patientKiosk"],
                ].map(([label, key]) => (
                  <label
                    key={key}
                    className="flex min-h-14 items-center justify-between text-sm font-medium"
                  >
                    <span>{label}</span>
                    <Switch
                      checked={Boolean(selected.settings[key as keyof AdminFacility["settings"]])}
                      onCheckedChange={(v) => change(key as keyof AdminFacility["settings"], v)}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
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
