import type { ReactNode } from "react";
import { PatientHeader } from "./PatientHeader";
import { PatientNavigation, PatientMobileNavigation } from "./PatientNavigation";
import { PatientAssistant } from "./PatientAssistant";

export function PatientShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <a href="#patient-main" className="skip-link">
        Skip to main content
      </a>
      <PatientHeader />
      <PatientNavigation />
      <main
        id="patient-main"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-5 md:pb-10 md:pt-8 lg:px-8"
      >
        {children}
      </main>
      <PatientAssistant />
      <PatientMobileNavigation />
    </div>
  );
}
