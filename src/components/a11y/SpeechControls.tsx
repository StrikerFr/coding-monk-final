import { Square } from "lucide-react";
import { useAppLanguage, useVoiceAccessibility, type SpeechSpeed } from "@/lib/a11y";
import { cn } from "@/lib/utils";
import { speakable } from "./speakable";

const SPEEDS: SpeechSpeed[] = ["slow", "normal", "fast"];

/** Speech speed + stop speaking. Kept to the few settings a patient needs. */
export function SpeechControls() {
  const { t, language } = useAppLanguage();
  const { speed, setSpeed, stop, speechSupported } = useVoiceAccessibility();

  if (!speechSupported) return null;

  return (
    <div>
      <p
        className={cn(
          "mt-4 text-xs font-semibold uppercase text-muted-foreground",
          language === "hi" && "deva",
        )}
      >
        {t("voice.speed")}
      </p>
      <div role="radiogroup" aria-label={t("voice.speed")} className="mt-2 flex gap-2">
        {SPEEDS.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={speed === value}
            onClick={() => setSpeed(value)}
            {...speakable(t(`voice.speed.${value}` as const))}
            className={cn(
              "min-h-11 flex-1 rounded-md border text-sm font-semibold transition-colors",
              language === "hi" && "deva",
              speed === value
                ? "border-primary/40 bg-primary-soft text-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {t(`voice.speed.${value}` as const)}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={stop}
        {...speakable(t("voice.stop"))}
        className={cn(
          "mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-border text-sm font-semibold hover:bg-muted",
          language === "hi" && "deva",
        )}
      >
        <Square aria-hidden="true" className="size-3.5 fill-current" />
        {t("voice.stop")}
      </button>
    </div>
  );
}
