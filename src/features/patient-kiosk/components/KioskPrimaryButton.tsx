import { ArrowRight } from "lucide-react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import type { KioskTranslationKey } from "@/features/patient-kiosk/translations/en";
import { cn } from "@/lib/utils";
import { speakable } from "@/components/a11y";

/** The one dominant kiosk action. Large, terracotta, touch-first. */
export function KioskPrimaryButton({
  tkey,
  onClick,
  className,
  withArrow = true,
}: {
  tkey: KioskTranslationKey;
  onClick: () => void;
  className?: string;
  withArrow?: boolean;
}) {
  const { language, bilingual, tIn } = useKiosk();
  const other = language === "hi" ? "en" : "hi";

  return (
    <button
      type="button"
      onClick={onClick}
      {...speakable(tIn(language, tkey))}
      className={cn(
        "group inline-flex min-h-[5rem] w-full max-w-xl items-center justify-center gap-5 rounded-full bg-primary px-12",
        "text-primary-foreground shadow-[var(--shadow-lift)] transition-all duration-300 ease-[var(--ease-calm)]",
        "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] lg:min-h-[6rem]",
        className,
      )}
    >
      <span className="flex flex-wrap items-baseline justify-center gap-x-4">
        <span
          lang={language}
          className={cn("text-3xl font-semibold lg:text-4xl", language === "hi" && "deva")}
        >
          {tIn(language, tkey)}
        </span>
        {bilingual && (
          <span
            lang={other}
            className={cn("text-xl font-medium opacity-80 lg:text-2xl", other === "hi" && "deva")}
          >
            {tIn(other, tkey)}
          </span>
        )}
      </span>
      {withArrow && (
        <ArrowRight
          aria-hidden="true"
          className="size-8 shrink-0 transition-transform duration-300 ease-[var(--ease-calm)] group-hover:translate-x-1.5"
        />
      )}
    </button>
  );
}
