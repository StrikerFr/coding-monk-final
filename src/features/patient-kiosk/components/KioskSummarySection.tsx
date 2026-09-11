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
    <section className={cn("rounded-4xl border border-border bg-surface px-6 py-6", className)}>
      <KioskText
        tkey={titleKey}
        as="h2"
        className="text-sm font-semibold tracking-wide uppercase"
        secondaryClassName="text-xs font-normal tracking-normal normal-case"
      />
      <dl className="mt-5 space-y-5">
        {rows.map((row) => (
          <div
            key={row.labelKey}
            className="border-t border-border pt-4 first:border-t-0 first:pt-0"
          >
            <dt>
              <KioskText
                tkey={row.labelKey}
                as="span"
                speak={false}
                className="text-base font-semibold"
                secondaryClassName="text-sm font-normal"
              />
            </dt>
            <dd
              lang={row.value ? language : undefined}
              className={cn(
                "mt-2 text-lg leading-relaxed",
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
