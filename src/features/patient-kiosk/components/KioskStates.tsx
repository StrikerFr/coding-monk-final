import { AlertTriangle, Inbox, Loader2, WifiOff } from "lucide-react";
import type { ReactNode } from "react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { KioskText } from "./KioskText";
import { cn } from "@/lib/utils";

function StateFrame({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 rounded-4xl border border-border bg-surface px-8 py-12 text-center">
      <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-muted">
        {icon}
      </span>
      {children}
    </div>
  );
}

export function KioskLoading({ className }: { className?: string }) {
  const { t, language } = useKiosk();
  return (
    <div role="status" aria-live="polite" className={cn("py-16", className)}>
      <StateFrame icon={<Loader2 className="size-7 animate-spin text-primary" />}>
        <p className={cn("text-xl font-semibold", language === "hi" && "deva")}>
          {t("kiosk.state.loading")}
        </p>
      </StateFrame>
    </div>
  );
}

export function KioskError({ onRetry }: { onRetry?: () => void }) {
  const { t } = useKiosk();
  return (
    <div role="alert" className="py-16">
      <StateFrame icon={<AlertTriangle className="size-7 text-destructive" />}>
        <KioskText
          tkey="kiosk.state.error.title"
          className="text-2xl font-semibold"
          secondaryClassName="text-lg"
        />
        <KioskText tkey="kiosk.state.error.body" as="p" className="text-lg leading-relaxed" />
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-14 rounded-full bg-foreground px-8 text-lg font-semibold text-background transition-opacity hover:opacity-90"
          >
            {t("kiosk.state.error.retry")}
          </button>
        )}
      </StateFrame>
    </div>
  );
}

export function KioskOffline() {
  return (
    <div role="status" aria-live="polite" className="py-16">
      <StateFrame icon={<WifiOff className="size-7 text-secondary" />}>
        <KioskText
          tkey="kiosk.state.offline.title"
          className="text-2xl font-semibold"
          secondaryClassName="text-lg"
        />
        <KioskText tkey="kiosk.state.offline.body" as="p" className="text-lg leading-relaxed" />
      </StateFrame>
    </div>
  );
}

export function KioskEmpty() {
  return (
    <div className="py-16">
      <StateFrame icon={<Inbox className="size-7 text-muted-foreground" />}>
        <KioskText
          tkey="kiosk.state.empty"
          className="text-xl font-semibold"
          secondaryClassName="text-base"
        />
      </StateFrame>
    </div>
  );
}
