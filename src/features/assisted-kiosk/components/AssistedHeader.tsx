import { CircleHelp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAssistedKiosk } from "@/features/assisted-kiosk/assisted-kiosk-context";
import { AssistedAccessibility } from "./AssistedAccessibility";
import { GlobalLanguageSelector } from "@/components/a11y";
import { StaffProfileMenu } from "./StaffProfileMenu";

export function AssistedHeader() {
  const { session } = useAssistedKiosk();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="flex min-h-16 w-full items-center gap-3 px-4 sm:px-6">
        <Link
          to="/assisted-kiosk"
          className="flex min-h-12 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <img src="/logo.png" alt="" className="size-9 object-contain" />
          <span>
            <span className="block text-lg font-semibold leading-tight">MediKiosk</span>
            <span className="block text-xs font-medium uppercase text-primary">
              Assisted Care Workspace
            </span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <span className="hidden items-center gap-2 border-r border-border pr-3 text-xs font-medium text-muted-foreground md:flex">
            <span className="size-2 rounded-full bg-secondary" />
            {session.connection}
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="size-12" aria-label="Staff help">
                <CircleHelp />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <h2 className="font-semibold">Staff help</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                For this demonstration, ask an authorized supervisor if you need help with an
                assisted intake.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                No live support service is connected.
              </p>
            </PopoverContent>
          </Popover>
          <GlobalLanguageSelector size="compact" className="hidden sm:flex" />
          <AssistedAccessibility />
          <StaffProfileMenu />
        </div>
      </div>
    </header>
  );
}
