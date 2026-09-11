import { useEffect, useRef, useState } from "react";
import { LifeBuoy } from "lucide-react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { KioskText } from "./KioskText";

/**
 * Staff-assistance pathway. Deliberately not a chatbot and not a support desk —
 * it simply points the patient to a person standing nearby.
 */
export function KioskHelp() {
  const { t } = useKiosk();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-14 items-center gap-2.5 rounded-full bg-accent px-5 text-base font-semibold text-accent-foreground transition-all duration-300 ease-[var(--ease-calm)] hover:-translate-y-0.5"
      >
        <LifeBuoy aria-hidden="true" className="size-5" />
        <span className="hidden sm:inline">{t("kiosk.help.button")}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-6">
          <button
            type="button"
            aria-label={t("kiosk.help.close")}
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-foreground/35 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="kiosk-help-title"
            className="surface-panel animate-rise relative w-full max-w-xl rounded-4xl p-10 text-center"
          >
            <KioskText
              tkey="kiosk.help.title"
              as="div"
              className="text-3xl font-semibold"
              secondaryClassName="text-xl"
            />
            <span id="kiosk-help-title" className="sr-only">
              {t("kiosk.help.title")}
            </span>
            <KioskText
              tkey="kiosk.help.body"
              as="p"
              className="mt-6 text-xl leading-relaxed"
              secondaryClassName="text-lg"
            />
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="mt-9 min-h-16 w-full rounded-full bg-foreground px-10 text-xl font-semibold text-background transition-opacity hover:opacity-90"
            >
              {t("kiosk.help.close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
