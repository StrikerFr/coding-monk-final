import { Check } from "lucide-react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import type { KioskTranslationKey } from "@/features/patient-kiosk/translations/en";
import { cn } from "@/lib/utils";
import { KioskText } from "./KioskText";

/**
 * A large tappable choice. Used wherever the patient picks instead of speaking
 * (gender, papers they carry). Selection is always visible, never colour-only.
 */
export function KioskChoice({
  tkey,
  selected,
  onSelect,
  className,
}: {
  tkey: KioskTranslationKey;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}) {
  const { language, tIn } = useKiosk();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={selected}
      aria-label={tIn(language, tkey)}
      onClick={onSelect}
      className={cn(
        "flex min-h-13 sm:min-h-14 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 sm:px-5 sm:py-3 text-left transition-all",
        selected
          ? "border-primary bg-primary/10 shadow-[var(--shadow-lift)]"
          : "border-border bg-background hover:bg-muted",
        className,
      )}
    >
      <KioskText
        tkey={tkey}
        speak={false}
        as="span"
        className="text-base font-semibold sm:text-lg"
        secondaryClassName="text-sm font-normal"
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
        )}
      >
        {selected && <Check className="size-4" />}
      </span>
    </button>
  );
}
