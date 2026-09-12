import {
  Building2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Cog,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  Users,
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
import { useAdmin } from "@/features/admin/admin-context";
import { cn } from "@/lib/utils";
const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/roles", label: "Roles & Permissions", icon: ShieldCheck },
  { to: "/admin/facilities", label: "Facilities", icon: Building2 },
  { to: "/admin/audit", label: "Audit Log", icon: ClipboardList },
  { to: "/admin/configuration", label: "System Configuration", icon: Cog },
] as const;
function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Administration sections">
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
                  "group relative flex min-h-11 items-center gap-3 rounded-md px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground",
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
                <ChevronRight
                  className={cn("ml-auto size-3.5 opacity-0", active && "opacity-60")}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
function NavFooter() {
  return (
    <div className="mt-auto border-t border-border pt-3">
      <Button variant="ghost" className="min-h-11 w-full justify-start px-3 text-muted-foreground">
        <CircleHelp />
        Help
      </Button>
      <Button variant="ghost" className="min-h-11 w-full justify-start px-3 text-muted-foreground">
        <Settings />
        Settings
      </Button>
      <Link
        to="/operations"
        className="mt-3 flex min-h-10 items-center gap-2 rounded-md px-3 text-xs text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
      >
        Operations Console
        <ChevronRight className="ml-auto size-3.5" />
      </Link>
      <p className="px-3 pt-4 text-[11px] leading-relaxed text-muted-foreground">
        Synthetic administration only
      </p>
    </div>
  );
}
export function AdminSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface/75 lg:block">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col p-3">
        <p className="px-3 pb-3 pt-2 text-[11px] font-semibold uppercase text-muted-foreground">
          Access & configuration
        </p>
        <NavLinks />
        <NavFooter />
      </div>
    </aside>
  );
}
export function AdminMobileMenu() {
  const { mobileOpen, setMobileOpen } = useAdmin();
  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 lg:hidden"
          aria-label="Open administration navigation"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-[300px] flex-col bg-surface">
        <SheetHeader className="mb-7 text-left">
          <SheetTitle>Administration</SheetTitle>
          <SheetDescription>Demo administrative workspace</SheetDescription>
        </SheetHeader>
        <NavLinks onNavigate={() => setMobileOpen(false)} />
        <NavFooter />
      </SheetContent>
    </Sheet>
  );
}
