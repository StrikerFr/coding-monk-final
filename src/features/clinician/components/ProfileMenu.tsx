import { ChevronDown, Accessibility, LogOut, Settings, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClinician } from "@/features/clinician/clinician-context";

export function ProfileMenu() {
  const { clinician } = useClinician();
  const initials = clinician.name
    .replace("Dr. ", "")
    .split(" ")
    .map((part) => part[0])
    .join("");

  const notice = (label: string) => toast(`${label} is not part of this demonstration build yet.`);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border hover:bg-surface-sunken">
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-foreground"
        >
          {initials}
        </span>
        <span className="hidden sm:block">
          <span className="block text-sm font-semibold leading-tight">{clinician.name}</span>
          <span className="block text-xs text-muted-foreground">
            {clinician.department} · {clinician.role}
          </span>
        </span>
        <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block text-sm font-semibold">{clinician.name}</span>
          <span className="block text-xs font-normal text-muted-foreground">{clinician.role}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => notice("Profile")}>
          <UserRound aria-hidden="true" className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => notice("Preferences")}>
          <Settings aria-hidden="true" className="size-4" />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => notice("Accessibility settings")}>
          <Accessibility aria-hidden="true" className="size-4" />
          Accessibility
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => notice("Sign out")}>
          <LogOut aria-hidden="true" className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
