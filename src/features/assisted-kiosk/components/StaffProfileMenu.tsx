import { Accessibility, ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAssistedKiosk } from "@/features/assisted-kiosk/assisted-kiosk-context";

export function StaffProfileMenu() {
  const { session } = useAssistedKiosk();
  const notice = (label: string) => toast(`${label} is not active in this frontend demonstration.`);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex min-h-12 items-center gap-2 rounded-md px-2 text-left hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span
          className="flex size-9 items-center justify-center rounded-full bg-primary-soft font-semibold"
          aria-hidden="true"
        >
          RS
        </span>
        <span className="hidden sm:block">
          <span className="block text-sm font-semibold">{session.staffName}</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-secondary" />
            {session.availability}
          </span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block">{session.staffName}</span>
          <span className="block text-xs font-normal text-muted-foreground">
            {session.role} · Demo profile
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => notice("Profile")}>
          <UserRound />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => notice("Preferences")}>
          <Settings />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => notice("Accessibility")}>
          <Accessibility />
          Accessibility
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => notice("Sign out")}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
