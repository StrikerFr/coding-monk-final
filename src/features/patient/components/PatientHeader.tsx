import { Link } from "@tanstack/react-router";
import { usePatient } from "@/features/patient/patient-context";
import { PatientSearch } from "./PatientSearch";
import { PatientNotifications } from "./PatientNotifications";
import { PatientProfileMenu } from "./PatientProfileMenu";
import { PatientLanguageSwitch } from "./PatientLanguageSwitch";
import { PatientAccessibility } from "./PatientAccessibility";

export function PatientHeader() {
  const { t } = usePatient();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/92 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 sm:px-5 lg:px-8">
        <Link to="/patient" className="flex shrink-0 items-center gap-2.5 rounded-md">
          <img src="/logo.png" alt="" className="size-9 object-contain" />
          <span>
            <span className="block text-[17px] font-semibold leading-tight">MediKiosk</span>
            <span className="block text-xs text-muted-foreground">{t("brand.context")}</span>
          </span>
        </Link>
        <div className="ml-auto hidden flex-1 justify-center sm:flex">
          <PatientSearch />
        </div>
        <div className="ml-auto flex items-center gap-0.5 sm:ml-0">
          <div className="hidden xl:block">
            <PatientLanguageSwitch compact />
          </div>
          <PatientAccessibility />
          <PatientNotifications />
          <div className="hidden sm:block">
            <PatientProfileMenu />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-border px-4 py-2 sm:hidden">
        <PatientSearch className="min-w-0 flex-1" />
        <PatientLanguageSwitch compact />
      </div>
    </header>
  );
}
