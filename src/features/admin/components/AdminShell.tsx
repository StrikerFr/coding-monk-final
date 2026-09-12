import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminNav";
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-h-screen overflow-x-clip bg-background text-foreground">
        <a href="#admin-main" className="skip-link">
          Skip to main content
        </a>
        <AdminHeader />
        <div className="flex w-full">
          <AdminSidebar />
          <main
            id="admin-main"
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
