import { ArrowRight, Building2, ClipboardList, Clock3, ShieldCheck, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/features/admin/admin-context";
import { AdminError, AdminTableSkeleton } from "../AdminStates";
import { AdminPageHeader, SectionHeading } from "../AdminPrimitives";
const actions = [
  { to: "/admin/users", label: "Manage users", icon: Users },
  { to: "/admin/roles", label: "Review roles", icon: ShieldCheck },
  { to: "/admin/facilities", label: "Manage facilities", icon: Building2 },
  { to: "/admin/audit", label: "View audit log", icon: ClipboardList },
] as const;
export function AdminOverviewPage() {
  const { overview, audit, loading, error, retryLoad } = useAdmin();
  if (error) return <AdminError onRetry={retryLoad} />;
  return (
    <>
      <AdminPageHeader
        title="Administration"
        description="Manage access, facilities, and administrative controls."
      />
      <section
        aria-label="Administrative summary"
        className="grid border-y border-border sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          { label: "Users", value: overview?.users ?? 0, note: "Active", icon: Users },
          { label: "Roles", value: overview?.roles ?? 0, note: "Configured", icon: ShieldCheck },
          {
            label: "Facilities",
            value: overview?.facilities ?? 0,
            note: "Active",
            icon: Building2,
          },
          {
            label: "Pending actions",
            value: overview?.pendingActions ?? 0,
            note: "Requires review",
            icon: Clock3,
          },
        ].map((item, i) => (
          <div
            key={item.label}
            className={`flex items-start gap-4 px-4 py-5 ${i > 0 ? "sm:border-l sm:border-border" : ""} ${i === 2 ? "sm:border-l-0 xl:border-l" : ""}`}
          >
            <span className="flex size-10 items-center justify-center rounded-md bg-primary/8 text-primary">
              <item.icon className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.note} · synthetic</p>
            </div>
          </div>
        ))}
      </section>
      <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_.85fr]">
        <div className="space-y-7">
          <section>
            <SectionHeading eyebrow="Access review" title="Needs attention" />
            {loading ? (
              <AdminTableSkeleton />
            ) : (
              <ul className="divide-y divide-border">
                {overview?.attention.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
                      <Clock3 className="size-4" />
                    </span>
                    <p className="flex-1 text-sm font-medium">{item.text}</p>
                    <Button asChild variant="outline" className="min-h-10">
                      <Link to={item.to}>
                        Review
                        <ArrowRight />
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <SectionHeading
              eyebrow="Immutable record"
              title="Recent administrative activity"
              action={
                <Button asChild variant="link">
                  <Link to="/admin/audit">View all</Link>
                </Button>
              }
            />
            {loading ? (
              <AdminTableSkeleton />
            ) : (
              <ol className="divide-y divide-border">
                {audit.slice(0, 4).map((event) => (
                  <li
                    key={event.id}
                    className="grid gap-2 py-4 sm:grid-cols-[5rem_1fr_auto] sm:items-center"
                  >
                    <time className="text-xs font-semibold tabular-nums text-muted-foreground">
                      {event.timestamp}
                    </time>
                    <div>
                      <p className="text-sm font-medium">{event.action}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{event.target}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{event.id}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
        <section>
          <SectionHeading eyebrow="Administrative tools" title="Quick actions" />
          <div className="mt-3 divide-y divide-border border-y border-border">
            {actions.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group flex min-h-16 items-center gap-4 px-2 hover:bg-surface-sunken"
              >
                <item.icon className="size-5 text-primary" />
                <span className="flex-1 text-sm font-semibold">{item.label}</span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
          <p className="mt-4 border-l-2 border-primary pl-3 text-xs leading-relaxed text-muted-foreground">
            All values and actions shown here are synthetic. Backend authorization will remain the
            security boundary.
          </p>
        </section>
      </div>
    </>
  );
}
