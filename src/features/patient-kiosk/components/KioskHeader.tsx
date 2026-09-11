import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { KioskLanguageSwitcher } from "./KioskLanguageSwitcher";
import { KioskAccessibility } from "./KioskAccessibility";
import { KioskHelp } from "./KioskHelp";

/**
 * Kiosk header — task-focused, no marketing navigation. Only the controls a
 * patient standing at the screen needs.
 */
export function KioskHeader() {
  const { t } = useKiosk();

  return (
    <header className="border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="size-10 object-contain" />
          <div>
            <p className="text-xl font-semibold leading-none tracking-tight">MediKiosk</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{t("kiosk.status")}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <KioskLanguageSwitcher />
          <KioskAccessibility />
          <KioskHelp />
        </div>
      </div>
    </header>
  );
}
