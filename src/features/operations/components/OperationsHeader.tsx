import { ChevronDown, CircleHelp, LogOut, Settings, UserRound } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { OperationsAccessibility } from "./OperationsAccessibility";
import { GlobalLanguageSelector } from "@/components/a11y";
import { OperationsMobileMenu } from "./OperationsNav";
export function OperationsHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="flex h-16 w-full items-center gap-2 px-3 sm:px-5">
        <OperationsMobileMenu />
        <Link to="/operations" className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="size-8 object-contain" />
          <span className="hidden sm:block">
            <span className="block font-semibold leading-none">MediKiosk</span>
            <span className="mt-1 block text-[11px] font-semibold uppercase text-primary">
              Operations Console
            </span>
          </span>
        </Link>
        <span className="ml-2 hidden rounded-sm border border-primary/25 bg-primary/8 px-2 py-1 text-[10px] font-bold uppercase text-primary md:inline-flex">
          Demo environment
        </span>
        <div className="ml-auto flex items-center gap-1">
          <span className="mr-1 hidden items-center gap-2 border-r border-border pr-4 text-xs font-semibold text-accent-foreground md:flex">
            <span className="size-2 rounded-full bg-secondary" />
            Operational <span className="font-normal text-muted-foreground">Demo status</span>
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="size-10" aria-label="Operations help">
                <CircleHelp />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <h2 className="font-semibold">Operations help</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This demonstration uses synthetic system metadata. No live monitoring is connected.
              </p>
            </PopoverContent>
          </Popover>
          <GlobalLanguageSelector size="compact" className="hidden sm:flex" />
          <OperationsAccessibility />
          <DropdownMenu>
            <DropdownMenuTrigger className="flex min-h-10 items-center gap-2 rounded-md px-2 hover:bg-surface-sunken">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-xs font-bold">
                OD
              </span>
              <span className="hidden text-left md:block">
                <span className="block text-xs font-semibold">Operations User</span>
                <span className="block text-[11px] text-muted-foreground">Demo profile</span>
              </span>
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Operations Demo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserRound />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
