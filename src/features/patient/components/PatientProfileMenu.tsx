import { ChevronDown, HeartHandshake, LogOut, Settings, UserRound } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePatient } from "@/features/patient/patient-context";

export function PatientProfileMenu() {
  const { profile } = usePatient();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex min-h-11 items-center gap-2 rounded-md px-1.5 text-left hover:bg-surface-sunken">
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold"
        >
          MS
        </span>
        <span className="hidden lg:block">
          <span className="block text-sm font-semibold leading-tight">{profile.name}</span>
          <span className="block text-xs text-muted-foreground">Personal health space</span>
        </span>
        <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <span className="block">{profile.name}</span>
          <span className="block text-xs font-normal text-muted-foreground">
            Synthetic demonstration profile
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/patient/profile">
            <UserRound />
            Profile & preferences
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/patient/consents">
            <HeartHandshake />
            Privacy & consent
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/patient/profile">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <LogOut />
          Sign out unavailable in demo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
