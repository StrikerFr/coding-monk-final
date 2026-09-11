import {
  Accessibility,
  Eye,
  Minus,
  MoveHorizontal,
  PersonStanding,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useAppLanguage, useDisplayPreferences } from "@/lib/a11y";
import { cn } from "@/lib/utils";
import { GlobalLanguageSelector } from "./GlobalLanguageSelector";
import { ReadAloudToggle } from "./ReadAloudToggle";
import { SpeechControls } from "./SpeechControls";
import { speakable } from "./speakable";

/**
 * The canonical MediKiosk accessibility panel, shared by every surface:
 * language, Read Aloud, speech speed, text size, contrast and motion.
 */
export function AccessibilityMenu({
  triggerSize = "default",
  align = "end",
  triggerVariant = "icon",
  triggerClassName,
}: {
  triggerSize?: "default" | "large";
  align?: "start" | "center" | "end";
  /** "labelled" shows the word Accessibility next to the icon (public header). */
  triggerVariant?: "icon" | "labelled";
  triggerClassName?: string;
}) {
  const { t, language } = useAppLanguage();
  const display = useDisplayPreferences();
  const deva = language === "hi" ? "deva" : "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        {triggerVariant === "labelled" ? (
          <Button
            variant="ghost"
            className={cn(
              "min-h-11 gap-2 rounded-md px-3 text-sm font-semibold text-foreground hover:bg-muted",
              deva,
              triggerClassName,
            )}
            {...speakable(t("a11y.open"))}
          >
            <Accessibility aria-hidden="true" />
            {t("a11y.title")}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className={cn(triggerSize === "large" ? "size-14" : "size-10", triggerClassName)}
            aria-label={t("a11y.open")}
            {...speakable(t("a11y.open"))}
          >
            <Accessibility aria-hidden="true" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align={align} className="w-80 p-4">
        <h2 className={cn("font-semibold", deva)}>{t("a11y.title")}</h2>

        <p className={cn("mt-4 text-xs font-semibold uppercase text-muted-foreground", deva)}>
          {t("language.label")}
        </p>
        <GlobalLanguageSelector className="mt-2 w-full [&>button]:flex-1" />

        <p className={cn("mt-4 text-xs font-semibold uppercase text-muted-foreground", deva)}>
          {t("voice.title")}
        </p>
        <ReadAloudToggle className="mt-2 w-full justify-center" />
        <p className={cn("mt-2 text-xs text-muted-foreground", deva)}>{t("voice.hint")}</p>

        <SpeechControls />

        <p className={cn("mt-4 text-xs font-semibold uppercase text-muted-foreground", deva)}>
          {t("a11y.textSize")}
        </p>
        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-11"
            onClick={display.shrink}
            disabled={!display.canShrink}
            aria-label={t("a11y.decreaseText")}
          >
            <Minus aria-hidden="true" />
          </Button>
          <div className="flex h-11 flex-1 items-center justify-center rounded-md bg-muted">A</div>
          <Button
            variant="outline"
            size="icon"
            className="size-11"
            onClick={display.grow}
            disabled={!display.canGrow}
            aria-label={t("a11y.increaseText")}
          >
            <Plus aria-hidden="true" />
          </Button>
        </div>

        <label
          className={cn("mt-4 flex min-h-11 items-center justify-between text-sm font-medium")}
        >
          <span className={cn("flex items-center gap-2", deva)}>
            <Eye aria-hidden="true" className="size-4" />
            {t("a11y.contrast")}
          </span>
          <Switch checked={display.highContrast} onCheckedChange={display.setHighContrast} />
        </label>
        <label className="flex min-h-11 items-center justify-between text-sm font-medium">
          <span className={cn("flex items-center gap-2", deva)}>
            <MoveHorizontal aria-hidden="true" className="size-4" />
            {t("a11y.motion")}
          </span>
          <Switch checked={display.reduceMotion} onCheckedChange={display.setReduceMotion} />
        </label>

        <label className="flex min-h-11 items-center justify-between text-sm font-medium">
          <span className={cn("flex items-center gap-2", deva)}>
            <PersonStanding aria-hidden="true" className="size-4" />
            Screen reader friendly
          </span>
          <Switch
            checked={display.screenReaderMode}
            onCheckedChange={display.setScreenReaderMode}
            aria-label="Screen reader friendly"
          />
        </label>

        <Button
          variant="ghost"
          className={cn("mt-2 w-full", deva)}
          onClick={display.reset}
          aria-label={t("a11y.reset")}
        >
          <RotateCcw aria-hidden="true" />
          {t("a11y.reset")}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
