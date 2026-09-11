import {
  ClipboardList,
  FileText,
  FolderOpen,
  HeartHandshake,
  History,
  Home,
  UserRound,
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { usePatient } from "@/features/patient/patient-context";
import { cn } from "@/lib/utils";

const items = [
  { to: "/patient", key: "nav.home", icon: Home, exact: true },
  { to: "/patient/timeline", key: "nav.timeline", icon: History },
  { to: "/patient/reports", key: "nav.reports", icon: FileText },
  { to: "/patient/documents", key: "nav.documents", icon: FolderOpen },
  { to: "/patient/intakes", key: "nav.intakes", icon: ClipboardList },
  { to: "/patient/consents", key: "nav.consent", icon: HeartHandshake },
  { to: "/patient/profile", key: "nav.profile", icon: UserRound },
] as const;

export function PatientNavigation() {
  const { t } = usePatient();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <nav
      aria-label="My Health navigation"
      className="hidden border-b border-border bg-surface md:block"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-5 lg:px-8">
        {items.map((item) => {
          const active =
            "exact" in item && item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-12 shrink-0 items-center gap-2 px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                active &&
                  "text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary",
              )}
            >
              <item.icon aria-hidden="true" className="size-4" />
              {t(item.key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

const mobileItems = [
  items[0],
  items[1],
  { to: "/patient/reports", key: "nav.records", icon: FileText },
  items[3],
  items[6],
] as const;
export function PatientMobileNavigation() {
  const { t } = usePatient();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <nav
      aria-label="Mobile My Health navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div className="grid grid-cols-5">
        {mobileItems.map((item) => {
          const active =
            item.to === "/patient" ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium text-muted-foreground",
                active && "text-primary",
              )}
            >
              <item.icon aria-hidden="true" className="size-5" />
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
