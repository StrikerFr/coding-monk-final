import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OperationsHeader } from "./OperationsHeader";
import { OperationsSidebar } from "./OperationsNav";
export function OperationsShell({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-h-screen overflow-x-clip bg-background text-foreground">
        <a href="#operations-main" className="skip-link">
          Skip to main content
        </a>
        <OperationsHeader />
        <div className="flex w-full">
          <OperationsSidebar />
          <main
            id="operations-main"
            tabIndex={-1}
            className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-7"
          >
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
