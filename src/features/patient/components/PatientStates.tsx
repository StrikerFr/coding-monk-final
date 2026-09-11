import { AlertTriangle, CloudOff, Inbox, Loader2, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePatient } from "@/features/patient/patient-context";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center border-y border-border py-12 text-center">
      {children}
    </div>
  );
}
export function PatientLoading() {
  const { t } = usePatient();
  return (
    <Frame>
      <Loader2 aria-hidden="true" className="size-7 animate-spin text-primary" />
      <p role="status" className="mt-4 font-semibold">
        {t("state.loading")}
      </p>
    </Frame>
  );
}
export function PatientEmpty() {
  const { t } = usePatient();
  return (
    <Frame>
      <Inbox aria-hidden="true" className="size-7 text-muted-foreground" />
      <h2 className="mt-4 text-xl font-semibold">{t("state.empty")}</h2>
      <p className="mt-1 text-muted-foreground">{t("state.emptyBody")}</p>
    </Frame>
  );
}
export function PatientError({ onRetry }: { onRetry: () => void }) {
  const { t } = usePatient();
  return (
    <Frame>
      <AlertTriangle aria-hidden="true" className="size-7 text-destructive" />
      <h2 className="mt-4 text-xl font-semibold">{t("state.error")}</h2>
      <Button className="mt-4" onClick={onRetry}>
        <RefreshCw />
        {t("state.retry")}
      </Button>
    </Frame>
  );
}
export function PatientOffline({ lastUpdated }: { lastUpdated: string }) {
  const { t } = usePatient();
  return (
    <div
      role="status"
      className="mb-5 flex items-start gap-3 rounded-lg border border-border bg-surface-sunken px-4 py-3"
    >
      <WifiOff aria-hidden="true" className="mt-0.5 size-5 text-primary" />
      <div>
        <p className="font-semibold">{t("state.offline")}</p>
        <p className="text-sm text-muted-foreground">
          {t("state.offlineBody")} Last updated: {lastUpdated}
        </p>
      </div>
    </div>
  );
}
export function PatientUnsynced() {
  const { t } = usePatient();
  return (
    <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
      <CloudOff aria-hidden="true" className="size-4" />
      {t("state.unsynced")}
    </div>
  );
}
