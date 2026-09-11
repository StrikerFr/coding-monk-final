import { useMemo, useState } from "react";
import { Building2, ShieldCheck, UserRound } from "lucide-react";
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
import { useAdmin } from "@/features/admin/admin-context";
import type { AdminUser, AdminUserStatus } from "@/features/admin/types";
import { AdminEmpty, AdminError, UsersSkeleton } from "../AdminStates";
import { AdminPageHeader, DemoFeedback, SearchField } from "../AdminPrimitives";
import { AdminStatus } from "../AdminStatus";
const filters = ["All", "Active", "Inactive", "Pending"] as const;
export function AdminUsersPage() {
  const { users, roles, facilities, loading, error, retryLoad, updateUser } = useAdmin();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [confirm, setConfirm] = useState<AdminUser | null>(null);
  const [message, setMessage] = useState("");
  const shown = useMemo(
    () =>
      users.filter(
        (user) =>
          (filter === "All" || user.status === filter) &&
          `${user.name} ${user.id}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [users, filter, query],
  );
  if (error) return <AdminError onRetry={retryLoad} />;
  const changeStatus = async (user: AdminUser) => {
    const status: AdminUserStatus = user.status === "Active" ? "Inactive" : "Active";
    await updateUser(user.id, { status });
    setSelected({ ...user, status });
    setConfirm(null);
    setMessage(`User status updated in demo mode.`);
  };
  return (
    <>
      <AdminPageHeader
        title="Users"
        description="Manage platform users and their access assignments."
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <SearchField value={query} onChange={setQuery} placeholder="Search by name or user ID" />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter users by status">
          {filters.map((item) => (
            <Button
              key={item}
              variant={filter === item ? "default" : "outline"}
              onClick={() => setFilter(item)}
              className="min-h-11"
            >
              {item}
            </Button>
          ))}
        </div>
      </div>
      {message && (
        <div className="mb-4">
          <DemoFeedback message={message} />
        </div>
      )}
      {loading ? (
        <UsersSkeleton />
      ) : shown.length === 0 ? (
        <AdminEmpty title="No users match your search." />
      ) : (
        <>
          <div className="hidden overflow-hidden border-y border-border md:block">
            <table className="w-full text-left">
              <thead className="bg-surface-sunken/70 text-[11px] uppercase text-muted-foreground">
                <tr>
                  {["Name", "Role", "Facility", "Status", "Last activity", "Action"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shown.map((user) => (
                  <tr key={user.id} className="hover:bg-surface/70">
                    <td className="px-4 py-4">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.id}</div>
                    </td>
                    <td className="px-4 py-4 text-sm">{user.role}</td>
                    <td className="px-4 py-4 text-sm">{user.facility}</td>
                    <td className="px-4 py-4">
                      <AdminStatus status={user.status} />
                    </td>
                    <td className="px-4 py-4 text-sm tabular-nums text-muted-foreground">
                      {user.lastActivity}
                    </td>
                    <td className="px-4 py-4">
                      <Button variant="outline" onClick={() => setSelected(user)}>
                        {user.status === "Pending" ? "Review" : "View"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-border border-y border-border md:hidden">
            {shown.map((user) => (
              <li key={user.id} className="py-4">
                <button
                  onClick={() => setSelected(user)}
                  className="w-full rounded-md p-2 text-left hover:bg-surface-sunken"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-xs font-bold">
                      {user.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.id} · {user.role}
                      </p>
                      <p className="mt-2 text-sm">{user.facility}</p>
                    </div>
                    <AdminStatus status={user.status} />
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
            <DialogTitle>User access detail</DialogTitle>
            <DialogDescription>
              Synthetic assignment details for this demo environment.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 border-y border-border py-4">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft font-bold">
                  {selected.initials}
                </span>
                <div>
                  <p className="text-lg font-semibold">{selected.name}</p>
                  <p className="text-sm text-muted-foreground">{selected.id}</p>
                </div>
                <span className="ml-auto">
                  <AdminStatus status={selected.status} />
                </span>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">Role</dt>
                  <dd className="mt-1 flex items-center gap-2 font-medium">
                    <ShieldCheck className="size-4 text-primary" />
                    {selected.role}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">
                    Facility
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 font-medium">
                    <Building2 className="size-4 text-primary" />
                    {selected.facility}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">
                    Last activity
                  </dt>
                  <dd className="mt-1 font-medium">{selected.lastActivity}</dd>
                </div>
              </dl>
              <div>
                <h3 className="text-sm font-semibold">Access summary</h3>
                <ul className="mt-2 divide-y divide-border border-y border-border">
                  {selected.access.map((item) => (
                    <li key={item.label} className="flex items-center justify-between py-3 text-sm">
                      <span>{item.label}</span>
                      <span className="font-semibold">
                        {item.assigned ? "Allowed" : "Not assigned"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Role
                  <Select
                    value={selected.role}
                    onValueChange={(role) => {
                      void updateUser(selected.id, { role });
                      setSelected({ ...selected, role });
                      setMessage("Role updated in demo mode.");
                    }}
                  >
                    <SelectTrigger className="mt-1 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <label className="text-sm font-medium">
                  Facility
                  <Select
                    value={selected.facility}
                    onValueChange={(facility) => {
                      void updateUser(selected.id, { facility });
                      setSelected({ ...selected, facility });
                      setMessage("Facility updated in demo mode.");
                    }}
                  >
                    <SelectTrigger className="mt-1 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Facilities">All Facilities</SelectItem>
                      {facilities.map((f) => (
                        <SelectItem key={f.id} value={f.name}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
            {selected && (
              <Button
                variant={selected.status === "Active" ? "destructive" : "default"}
                onClick={() => setConfirm(selected)}
              >
                {selected.status === "Active" ? "Deactivate" : "Activate"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirm?.status === "Active" ? "Deactivate" : "Activate"} this user?
            </DialogTitle>
            <DialogDescription>
              {confirm?.status === "Active"
                ? "This will remove their active access"
                : "This will grant active access"}{" "}
              in the demo environment.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-muted p-4">
            <p className="font-semibold">{confirm?.name}</p>
            <p className="text-sm text-muted-foreground">{confirm?.id}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant={confirm?.status === "Active" ? "destructive" : "default"}
              onClick={() => confirm && void changeStatus(confirm)}
            >
              {confirm?.status === "Active" ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
