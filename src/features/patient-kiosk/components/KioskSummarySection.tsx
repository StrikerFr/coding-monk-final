import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import type { KioskTranslationKey } from "@/features/patient-kiosk/translations/en";
import { cn } from "@/lib/utils";
import { KioskText } from "./KioskText";

export type SummaryRow = { labelKey: KioskTranslationKey; value: string };

/**
 * Read-back of what the kiosk noted. Values are shown exactly as captured — the
 * kiosk never rewrites or interprets what the patient said.
 */
export function KioskSummarySection({
  titleKey,
  rows,
  className,
}: {
  titleKey: KioskTranslationKey;
  rows: SummaryRow[];
  className?: string;
}) {
  const { language, t } = useKiosk();
  const deva = language === "hi";

  return (
    <section className={cn("rounded-3xl border border-border bg-surface px-4 py-3 sm:px-5 sm:py-4", className)}>
      <KioskText
        tkey={titleKey}
        as="h2"
        className="text-xs sm:text-sm font-semibold tracking-wide uppercase"
        secondaryClassName="text-xs font-normal tracking-normal normal-case"
      />
      <dl className="mt-3 space-y-2.5">
        {rows.map((row) => (
          <div
            key={row.labelKey}
            className="border-t border-border pt-2 first:border-t-0 first:pt-0"
          >
            <dt>
              <KioskText
                tkey={row.labelKey}
                as="span"
                speak={false}
                className="text-sm sm:text-base font-semibold"
                secondaryClassName="text-xs sm:text-sm font-normal"
              />
            </dt>
            <dd
              lang={row.value ? language : undefined}
              className={cn(
                "mt-0.5 text-base sm:text-lg leading-snug",
                row.value ? deva && "deva" : "text-muted-foreground",
              )}
            >
              {row.value || <span className={cn(deva && "deva")}>{t("kiosk.confirm.empty")}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
