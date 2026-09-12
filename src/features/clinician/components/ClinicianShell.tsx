import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClinicianHeader } from "./ClinicianHeader";
import { ClinicianSidebar } from "./ClinicianSidebar";

/**
 * Reusable clinician application shell: header + sidebar + dense content area.
 * Deliberately quieter and more compact than the patient kiosk shell.
 */
export function ClinicianShell({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-h-screen bg-background text-foreground">
        <a href="#clinician-main" className="skip-link">
          Skip to main content
        </a>
        <ClinicianHeader />
        <div className="flex">
          <ClinicianSidebar />
          <main
            id="clinician-main"
            tabIndex={-1}
            className="min-w-0 flex-1 px-4 py-5 lg:px-7 lg:py-6 2xl:px-10"
          >
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
