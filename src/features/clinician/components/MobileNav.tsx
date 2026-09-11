import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ClipboardList,
  FileText,
  History,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { useClinician } from "@/features/clinician/clinician-context";
import { cn } from "@/lib/utils";

const items = [
  { to: "/clinician", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/clinician/worklist", label: "Worklist", icon: ClipboardList },
  { to: "/clinician/patients", label: "Patients", icon: Users },
  { to: "/clinician/documents", label: "Documents", icon: FileText },
  { to: "/clinician/alerts", label: "Alerts", icon: Bell },
  { to: "/clinician/timeline", label: "Timeline", icon: History },
  { to: "/clinician/settings", label: "Settings", icon: Settings },
] as const;

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { clinician } = useClinician();

  return (
    <nav aria-label="Clinical workspace sections" className="flex h-full flex-col">
      <ul className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active =
            "exact" in item && item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium text-muted-foreground",
                  active && "bg-surface-sunken text-foreground",
                )}
              >
                <item.icon aria-hidden="true" className="size-[18px]" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-border px-5 py-4">
        <p className="text-sm font-semibold">{clinician.name}</p>
        <p className="text-xs text-muted-foreground">{clinician.role}</p>
      </div>
    </nav>
  );
}
