import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Keyboard, Loader2, Mic, Square, Volume2 } from "lucide-react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import type { KioskTranslationKey } from "@/features/patient-kiosk/translations/en";
import { useVoiceInput } from "@/lib/voice/use-voice-input";
import { useVoicePlayback } from "@/lib/voice/use-voice-playback";
import { cn } from "@/lib/utils";
import { KioskText } from "./KioskText";

/**
 * One spoken question: the kiosk can read it aloud, and the patient answers by
 * speaking. The recognised words are always shown back for the patient to see.
 */
export function KioskVoiceAnswer({
  questionKey,
  questionText: suppliedQuestionText,
  answer,
  onAnswer,
}: {
  questionKey?: KioskTranslationKey;
  questionText?: string;
  answer: string | undefined;
  onAnswer: (text: string) => void;
}) {
  const { language, tIn, t } = useKiosk();
  const playback = useVoicePlayback();
  const voice = useVoiceInput({ language, onTranscript: onAnswer });
  const [typing, setTyping] = useState(false);
  const [typedText, setTypedText] = useState(answer ?? "");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const typedTextRef = useRef(typedText);
  typedTextRef.current = typedText;
  const onAnswerRef = useRef(onAnswer);
  onAnswerRef.current = onAnswer;

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
        onAnswerRef.current(typedTextRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!typing) {
      setTypedText(answer ?? "");
    }
  }, [answer, typing]);

  const handleTypedChange = (val: string) => {
    const text = val.slice(0, 1000);
    setTypedText(text);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      onAnswer(text);
    }, 500);
  };

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    onAnswer(typedText);
  };

  const questionText = suppliedQuestionText ?? (questionKey ? tIn(language, questionKey) : "");
  const questionId = questionKey ?? questionText;
  const listening = voice.state === "listening";
  const working = voice.state === "understanding";
  const errorKey: KioskTranslationKey | null =
    voice.error === "permission"
      ? "kiosk.voice.error.permission"
      : voice.error === "empty"
        ? "kiosk.voice.error.empty"
        : voice.error === "failed"
          ? "kiosk.voice.error.failed"
          : null;

  const shownAnswer = voice.transcript || (typing ? typedText : answer) || "";

  return (
    <section
      className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/8 backdrop-blur-md"
      style={{ boxShadow: "0 8px 40px 0 oklch(0 0 0 / 0.45)" }}
    >
      {/* ── Question header ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/8 px-5 py-4 sm:px-6 sm:py-5">
        {questionKey ? (
          <KioskText
            tkey={questionKey}
            as="h2"
            className="max-w-xl text-lg font-semibold text-white sm:text-xl"
            secondaryClassName="text-sm font-normal text-white/70"
          />
        ) : (
          <h2
            lang={language}
            className={cn("max-w-xl text-lg font-semibold text-white sm:text-xl", language === "hi" && "deva")}
          >
            {questionText}
          </h2>
        )}
        <button
          type="button"
          onClick={() =>
            playback.isSpeaking ? playback.stop() : void playback.speak(questionText, questionId)
          }
          className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 text-xs font-semibold text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 sm:text-sm"
        >
          <Volume2 aria-hidden="true" className="size-3.5 text-primary" />
          <span className={cn(language === "hi" && "deva")}>
            {playback.isSpeaking ? t("kiosk.voice.stopListening") : t("kiosk.voice.listen")}
          </span>
        </button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-5 py-4 sm:px-6 sm:py-5">
        {typing ? (
          /* ── Keyboard mode ───────────────────────────────────────── */
          <div className="flex flex-1 flex-col gap-3">
            <label
              htmlFor={`typed-${questionId}`}
              className={cn("text-sm font-semibold text-white/80 sm:text-base", language === "hi" && "deva")}
            >
              {t("kiosk.voice.typeLabel")}
            </label>
            <textarea
              id={`typed-${questionId}`}
              lang={language}
              value={typedText}
              onChange={(event) => handleTypedChange(event.target.value)}
              onBlur={handleBlur}
              maxLength={1000}
              rows={4}
              placeholder={t("kiosk.voice.typePlaceholder")}
              className={cn(
                "flex-1 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-base leading-relaxed text-white placeholder:text-white/30 sm:text-lg",
                "focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none",
                language === "hi" && "deva",
              )}
            />
            <button
              type="button"
              onClick={() => {
                handleBlur();
                setTyping(false);
              }}
              className="inline-flex min-h-9 w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-xs font-semibold text-white/80 transition-colors hover:bg-white/20 sm:text-sm"
            >
              <Mic aria-hidden="true" className="size-4 text-primary" />
              <span className={cn(language === "hi" && "deva")}>{t("kiosk.voice.useVoice")}</span>
            </button>
          </div>
        ) : (
          /* ── Voice mode ──────────────────────────────────────────── */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            {/* Mic button */}
            <div className="relative">
              {listening && (
                <>
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-primary/20 animate-ping"
                    style={{ animationDuration: "1.4s" }}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full border-4 border-primary/40 transition-transform duration-100"
                    style={{ transform: `scale(${1 + Math.min(voice.level, 1) * 0.4})` }}
                  />
                </>
              )}
              <button
                type="button"
                onClick={() => (listening ? void voice.stop() : void voice.start())}
                disabled={working}
                aria-label={listening ? t("kiosk.voice.stopSpeaking") : t("kiosk.voice.speak")}
                className={cn(
                  "relative inline-flex size-20 items-center justify-center rounded-full text-primary-foreground transition-all duration-300 sm:size-24",
                  listening
                    ? "bg-rose-500 shadow-[0_0_0_4px_oklch(0.63_0.22_25/0.25)] scale-105"
                    : "bg-primary shadow-[var(--shadow-lift)] hover:-translate-y-1 active:scale-95 disabled:opacity-70",
                )}
              >
                {working ? (
                  <Loader2 aria-hidden="true" className="size-8 animate-spin sm:size-9" />
                ) : listening ? (
                  <Square aria-hidden="true" className="size-7 fill-current sm:size-8" />
                ) : (
                  <Mic aria-hidden="true" className="size-8 sm:size-9" />
                )}
              </button>
            </div>

            <p aria-live="polite" className="min-h-6 text-sm font-semibold text-white/80 sm:text-base">
              <span className={cn(language === "hi" && "deva")}>
                {listening
                  ? t("kiosk.voice.listeningNow")
                  : working
                    ? t("kiosk.voice.writing")
                    : shownAnswer
                      ? t("kiosk.voice.saved")
                      : t("kiosk.voice.speak")}
              </span>
            </p>

            {/* Type instead */}
            {!listening && !working && (
              <button
                type="button"
                onClick={() => {
                  voice.reset();
                  setTyping(true);
                }}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-xs font-semibold text-white/70 transition-colors hover:bg-white/20 sm:text-sm"
              >
                <Keyboard aria-hidden="true" className="size-4 text-primary" />
                <span className={cn(language === "hi" && "deva")}>{t("kiosk.voice.typeInstead")}</span>
              </button>
            )}

            {/* Error */}
            {errorKey && (
              <KioskText
                tkey={errorKey}
                as="p"
                className="text-xs font-medium text-rose-400 sm:text-sm"
              />
            )}
            {playback.failed && (
              <KioskText
                tkey="kiosk.voice.playbackFailed"
                as="p"
                className="text-xs text-white/40 sm:text-sm"
              />
            )}
          </div>
        )}

        {/* ── Saved answer ─────────────────────────────────────────── */}
        {shownAnswer && (
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-left backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-emerald-400" />
                <KioskText
                  tkey="kiosk.voice.yourAnswer"
                  as="p"
                  className="text-xs font-semibold tracking-wide text-white/50 uppercase"
                />
              </div>
              <button
                type="button"
                onClick={() => voice.reset()}
                className="inline-flex min-h-7 items-center rounded-full border border-white/15 bg-white/10 px-3 text-xs font-semibold text-white/70 transition-colors hover:bg-white/20"
              >
                <span className={cn(language === "hi" && "deva")}>{t("kiosk.voice.again")}</span>
              </button>
            </div>
            <p
              lang={language}
              className={cn(
                "mt-1.5 text-base font-medium leading-snug text-white/90 line-clamp-3 sm:text-lg",
                language === "hi" && "deva",
              )}
            >
              {shownAnswer}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
