import { Link, useRouterState } from "@tanstack/react-router";
import { speakable } from "@/components/a11y";
import {
  Bell,
  ClipboardList,
  FileText,
  History,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useClinician } from "@/features/clinician/clinician-context";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/clinician", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/clinician/worklist", label: "Worklist", icon: ClipboardList },
  { to: "/clinician/patients", label: "Patients", icon: Users },
  { to: "/clinician/documents", label: "Documents", icon: FileText },
  { to: "/clinician/alerts", label: "Alerts", icon: Bell },
  { to: "/clinician/timeline", label: "Timeline", icon: History },
] as const;

export function ClinicianSidebar() {
  const { clinician, sidebarCollapsed, toggleSidebar } = useClinician();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  const availabilityLabel =
    clinician.availability === "available"
      ? "Available"
      : clinician.availability === "busy"
        ? "In consultation"
        : "Away";

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-border bg-surface/75 transition-[width] duration-200 lg:sticky lg:top-16 lg:flex lg:h-[calc(100vh-4rem)] lg:self-start lg:flex-col",
        sidebarCollapsed ? "lg:w-[72px]" : "lg:w-[224px]",
      )}
      aria-label="Clinical workspace sections"
    >
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {nav.map((item) => {
            const active = isActive(item.to, "exact" in item ? item.exact : false);
            const link = (
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                {...speakable(item.label)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-medium text-muted-foreground transition-colors hover:bg-surface-sunken/75 hover:text-foreground",
                  active && "bg-primary/8 font-semibold text-foreground",
                  sidebarCollapsed && "justify-center px-0",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -left-3 h-7 w-[3px] rounded-r-full bg-primary transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                <item.icon aria-hidden="true" className="size-[18px] shrink-0" />
                {sidebarCollapsed ? <span className="sr-only">{item.label}</span> : item.label}
              </Link>
            );
            return (
              <li key={item.to}>
                {sidebarCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                ) : (
                  link
                )}
              </li>
            );
          })}
        </ul>

        <div className="my-4 border-t border-border" role="separator" />

        <Link
          to="/clinician/settings"
          aria-current={pathname === "/clinician/settings" ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground",
            pathname === "/clinician/settings" && "bg-surface-sunken text-foreground",
            sidebarCollapsed && "justify-center px-0",
          )}
        >
          <Settings aria-hidden="true" className="size-[18px] shrink-0" />
          {sidebarCollapsed ? <span className="sr-only">Settings</span> : "Settings"}
        </Link>
      </nav>

      <div className="border-t border-border px-3 py-3">
        {!sidebarCollapsed && (
          <div className="rounded-lg bg-surface-sunken px-3 py-2.5">
            <p className="text-sm font-semibold leading-tight">{clinician.name}</p>
            <p className="text-xs text-muted-foreground">{clinician.role}</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
              <span aria-hidden="true" className="size-2 rounded-full bg-secondary" />
              {availabilityLabel}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen aria-hidden="true" className="size-4" />
          ) : (
            <PanelLeftClose aria-hidden="true" className="size-4" />
          )}
          {sidebarCollapsed ? <span className="sr-only">Expand sidebar</span> : "Collapse"}
        </button>
      </div>
    </aside>
  );
}
