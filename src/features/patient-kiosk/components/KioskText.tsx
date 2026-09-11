import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import type { KioskTranslationKey } from "@/features/patient-kiosk/translations/en";
import { cn } from "@/lib/utils";
import { speakable } from "@/components/a11y";

/**
 * Bilingual text pair. The selected language leads; the other language follows
 * quietly beneath so patients can cross-check. Strings always come from the
 * translation files — never hardcoded in screens.
 */
export function KioskText({
  tkey,
  className,
  secondaryClassName,
  as: As = "span",
  showSecondary = true,
  speak = true,
  vars,
}: {
  tkey: KioskTranslationKey;
  className?: string;
  secondaryClassName?: string;
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3";
  showSecondary?: boolean;
  /** Set false for decorative or repeated text. */
  speak?: boolean;
  vars?: Record<string, string | number>;
}) {
  const { language, bilingual, tIn } = useKiosk();
  const other = language === "hi" ? "en" : "hi";
  const primary = tIn(language, tkey, vars);
  const secondary = tIn(other, tkey, vars);

  return (
    <As className={className} {...(speak ? speakable(primary) : {})}>
      <span lang={language} className={cn("block", language === "hi" && "deva")}>
        {primary}
      </span>
      {bilingual && showSecondary && secondary !== primary && (
        <span
          lang={other}
          className={cn(
            "mt-1 block text-muted-foreground",
            other === "hi" && "deva",
            secondaryClassName,
          )}
        >
          {secondary}
        </span>
      )}
    </As>
  );
}
