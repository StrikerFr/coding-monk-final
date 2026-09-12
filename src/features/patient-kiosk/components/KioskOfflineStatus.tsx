import { CloudOff } from "lucide-react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import type { KioskSyncStatus } from "@/features/patient-kiosk/session";
import { cn } from "@/lib/utils";

/**
 * Makes uncertainty visible: when work only exists on this kiosk, say so.
 * Renders nothing while everything is synced, so the welcome screen stays calm.
 */
export function KioskOfflineStatus({
  status,
  className,
}: {
  status: KioskSyncStatus;
  className?: string;
}) {
  const { t, language } = useKiosk();
  if (status === "synced") return null;

  return (
    <p
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border border-border bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground",
        language === "hi" && "deva",
        className,
      )}
    >
      <CloudOff aria-hidden="true" className="size-4" />
      {t("kiosk.state.unsynced")}
    </p>
  );
}
