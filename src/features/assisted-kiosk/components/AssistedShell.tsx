import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AssistedHeader } from "./AssistedHeader";
import { AssistedMobileNav, AssistedNavigation } from "./AssistedNavigation";
export function AssistedShell({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-h-screen overflow-x-clip bg-background text-foreground">
        <a href="#assisted-main" className="skip-link">
          Skip to main content
        </a>
        <AssistedHeader />
        <div className="flex w-full">
          <AssistedNavigation />
          <main
            id="assisted-main"
            tabIndex={-1}
            className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10 lg:px-8 lg:pt-8"
          >
            {children}
          </main>
        </div>
        <AssistedMobileNav />
      </div>
    </TooltipProvider>
  );
}
