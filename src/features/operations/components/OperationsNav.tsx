import {
  CircleHelp,
  FileWarning,
  History,
  LayoutDashboard,
  Menu,
  Search,
  Send,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { speakable } from "@/components/a11y";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useOperations } from "@/features/operations/operations-context";
import { cn } from "@/lib/utils";
const nav = [
  { to: "/operations", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/operations/dlq", label: "Dead Letter Queue", icon: FileWarning },
  { to: "/operations/manual-review", label: "Manual Review", icon: ShieldCheck },
  { to: "/operations/outbox", label: "Outbox Health", icon: Send },
  { to: "/operations/search", label: "Search Health", icon: Search },
  { to: "/operations/replay", label: "Audited Replay", icon: History },
] as const;
function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Operations sections">
      <ul className="space-y-1">
        {nav.map((item) => {
          const active =
            "exact" in item && item.exact ? path === item.to : path.startsWith(item.to);
          return (
            <li key={item.to}>
              <Link
                {...speakable(item.label)}
                to={item.to}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium text-muted-foreground hover:bg-surface-sunken hover:text-foreground",
                  active && "bg-primary/8 font-semibold text-foreground",
                )}
              >
                <span
                  className={cn(
                    "absolute -left-3 h-6 w-[3px] rounded-r-full bg-primary",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                <item.icon className="size-[17px]" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
export function OperationsSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-surface/75 lg:block">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col p-3">
        <p className="px-3 pb-3 pt-2 text-[11px] font-semibold uppercase text-muted-foreground">
          Control room
        </p>
        <NavLinks />
        <div className="mt-auto border-t border-border pt-3">
          <button className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-[13px] text-muted-foreground hover:bg-surface-sunken">
            <CircleHelp className="size-[17px]" />
            Help
          </button>
          <button className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-[13px] text-muted-foreground hover:bg-surface-sunken">
            <Settings className="size-[17px]" />
            Settings
          </button>
          <p className="px-3 pt-4 text-[11px] text-muted-foreground">Synthetic operations only</p>
        </div>
      </div>
    </aside>
  );
}
export function OperationsMobileMenu() {
  const { mobileOpen, setMobileOpen } = useOperations();
  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[290px] bg-surface">
        <SheetHeader className="mb-7 text-left">
          <SheetTitle>Operations Console</SheetTitle>
          <SheetDescription>Demo environment</SheetDescription>
        </SheetHeader>
        <NavLinks onNavigate={() => setMobileOpen(false)} />
        <div className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
          Synthetic operational data only
        </div>
      </SheetContent>
    </Sheet>
  );
}
