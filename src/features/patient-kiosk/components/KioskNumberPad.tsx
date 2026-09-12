import { Delete } from "lucide-react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import type { KioskTranslationKey } from "@/features/patient-kiosk/translations/en";
import { cn } from "@/lib/utils";
import { KioskText } from "./KioskText";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

/**
 * Big touch keypad for numbers, so patients never need a keyboard. It only ever
 * appends or removes digits — no validation or interpretation happens here.
 */
export function KioskNumberPad({
  labelKey,
  hintKey,
  value,
  maxLength,
  onChange,
  allowDecimal = false,
}: {
  labelKey: KioskTranslationKey;
  hintKey?: KioskTranslationKey;
  value: string;
  maxLength: number;
  onChange: (next: string) => void;
  allowDecimal?: boolean;
}) {
  const { language, t } = useKiosk();
  const deva = language === "hi";

  const append = (digit: string) => {
    if (digit === "." && (!allowDecimal || value.includes("."))) return;
    if (value.replace(".", "").length >= maxLength) return;
    onChange(value + digit);
  };

  return (
    <div className="rounded-3xl border border-border bg-surface px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex items-baseline justify-between gap-2">
        <KioskText tkey={labelKey} as="p" className="text-base font-semibold sm:text-lg" />
        {hintKey && (
          <KioskText tkey={hintKey} as="p" className="text-xs sm:text-sm text-muted-foreground" />
        )}
      </div>

      <p
        aria-live="polite"
        className="mt-2 flex min-h-11 sm:min-h-12 items-center justify-center rounded-xl sm:rounded-2xl border border-border bg-background px-4 py-1.5 sm:py-2 text-2xl sm:text-3xl font-semibold tabular-nums"
      >
        {value || "—"}
      </p>

      <div className="mt-2.5 sm:mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
        {DIGITS.map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => append(digit)}
            className={cn(
              "min-h-10 sm:min-h-11 md:min-h-12 rounded-xl sm:rounded-2xl border border-border bg-background text-xl sm:text-2xl font-semibold tabular-nums",
              "transition-colors hover:bg-muted active:scale-95",
              digit === "0" && "col-span-1",
            )}
          >
            {digit}
          </button>
        ))}
        {allowDecimal ? (
          <button
            type="button"
            onClick={() => append(".")}
            aria-label="."
            className="min-h-10 sm:min-h-11 md:min-h-12 rounded-xl sm:rounded-2xl border border-border bg-background text-xl sm:text-2xl font-semibold transition-colors hover:bg-muted active:scale-95"
          >
            .
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onChange("")}
            className="min-h-10 sm:min-h-11 md:min-h-12 rounded-xl sm:rounded-2xl border border-border bg-background text-xs sm:text-sm font-semibold transition-colors hover:bg-muted active:scale-95"
          >
            <span className={cn(deva && "deva")}>{t("kiosk.pad.clear")}</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => onChange(value.slice(0, -1))}
          aria-label={t("kiosk.pad.delete")}
          className="flex min-h-10 sm:min-h-11 md:min-h-12 items-center justify-center rounded-xl sm:rounded-2xl border border-border bg-background transition-colors hover:bg-muted active:scale-95"
        >
          <Delete aria-hidden="true" className="size-5" />
        </button>
      </div>
    </div>
  );
}
