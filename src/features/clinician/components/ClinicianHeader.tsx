import { Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useClinician } from "@/features/clinician/clinician-context";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationsMenu } from "./NotificationsMenu";
import { ProfileMenu } from "./ProfileMenu";
import { MobileNav } from "./MobileNav";
import { AccessibilityMenu, GlobalLanguageSelector } from "@/components/a11y";

export function ClinicianHeader() {
  const { connection } = useClinician();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
              <Menu aria-hidden="true" className="size-[18px]" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="border-b border-border px-5 py-4 text-base">
              Clinical Workspace
            </SheetTitle>
            <MobileNav />
          </SheetContent>
        </Sheet>

        <Link to="/clinician" className="flex items-center gap-2.5 rounded-md pr-2">
          <img src="/logo.png" alt="" className="size-8 object-contain" />
          <span className="leading-tight">
            <span className="block text-[17px] font-semibold tracking-tight">MediKiosk</span>
            <span className="block text-xs text-muted-foreground">Clinical Workspace</span>
          </span>
        </Link>

        <div className="ml-4 hidden flex-1 justify-center md:flex">
          <GlobalSearch />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <span
            className="hidden items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground xl:inline-flex"
            title="Demonstration status indicator"
          >
            <span
              aria-hidden="true"
              className={
                connection === "connected"
                  ? "size-2 rounded-full bg-secondary"
                  : "size-2 rounded-full bg-destructive"
              }
            />
            {connection === "connected" ? "Connected" : "Connection unavailable"}
          </span>
          <GlobalLanguageSelector size="compact" className="hidden sm:flex" />
          <AccessibilityMenu />
          <NotificationsMenu />
          <ProfileMenu />
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 md:hidden">
        <GlobalSearch className="max-w-none" />
      </div>
    </header>
  );
}
