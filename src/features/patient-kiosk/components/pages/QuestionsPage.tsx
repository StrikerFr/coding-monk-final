import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic } from "lucide-react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { patientKioskApi } from "@/features/patient-kiosk/api";
import { stepNumber } from "@/features/patient-kiosk/session";
import { KioskStepContainer } from "../KioskStepContainer";
import { KioskStepNav } from "../KioskStepNav";
import { KioskText } from "../KioskText";
import { KioskVoiceAnswer } from "../KioskVoiceAnswer";
import { cn } from "@/lib/utils";
import type { ClinicalFollowUpQuestion } from "@/lib/clinical/types";
import stepDoctorImg from "@/assets/step-doctor.jpg";
import stepSpeakImg from "@/assets/step-speak.jpg";

const FALLBACK: Record<"hi" | "en", string[]> = {
  en: [
    "When did this problem start, and how has it changed since then?",
    "What other symptoms have you noticed along with this problem?",
    "Are you taking any medicines, and do you have any medicine allergies?",
  ],
  hi: [
    "यह तकलीफ़ कब शुरू हुई, और तब से इसमें क्या बदलाव आया है?",
    "इस तकलीफ़ के साथ आपको और कौन से लक्षण महसूस हुए हैं?",
    "क्या आप कोई दवा ले रहे हैं, और क्या किसी दवा से एलर्जी है?",
  ],
};

const SIDE_IMAGES = [stepDoctorImg, stepSpeakImg, stepDoctorImg];

function fallbackQuestions(language: "hi" | "en"): ClinicalFollowUpQuestion[] {
  return FALLBACK[language].map((text, index) => ({ id: `clinical-fallback-${index + 1}`, text }));
}

/** The spoken part of check-in: questions answered by speaking or typing. */
export function QuestionsPage() {
  const { language, session, t, updateSession } = useKiosk();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(session?.answers ?? {});
  const [questions, setQuestions] = useState<ClinicalFollowUpQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);
  const hasLoadedRef = useRef<string | null>(null);

  const prepareQuestions = useCallback(async () => {
    setLoading(true);
    setUsedFallback(false);
    try {
      const prepared = await patientKioskApi.getClinicalFollowUps(undefined, language);
      setQuestions(prepared);
    } catch {
      setQuestions(fallbackQuestions(language));
      setUsedFallback(true);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    const key = `${session?.encounterId}:${language}`;
    if (!session?.encounterId || hasLoadedRef.current === key) return;
    hasLoadedRef.current = key;
    void prepareQuestions();
  }, [session?.encounterId, language, prepareQuestions]);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const sideImg = SIDE_IMAGES[index % SIDE_IMAGES.length];

  const handleAnswer = useCallback(
    (text: string) => {
      if (!question || !text.trim()) return;
      setAnswers((current) => {
        if (current[question.id] === text) return current;
        const next = { ...current, [question.id]: text };
        void patientKioskApi.saveAnswer(question.id, text, "voice", question.text);
        return next;
      });
    },
    [question],
  );

  return (
    <KioskStepContainer step={stepNumber("questions")} progress="quiet">
      {/* ── Loading state ─────────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/8 px-10 py-12 text-center backdrop-blur-md"
            style={{ boxShadow: "0 8px 40px 0 oklch(0 0 0 / 0.45)" }}
          >
            <div className="relative grid size-20 place-items-center rounded-full bg-primary/20">
              <Loader2 aria-hidden="true" className="size-9 animate-spin text-primary" />
            </div>
            <p className={cn("text-xl font-semibold text-white/90", language === "hi" && "deva")}>
              {t("kiosk.questions.preparing")}
            </p>
            <p className="text-sm text-white/50">{language === "hi" ? "कृपया प्रतीक्षा करें…" : "Tailoring your questions…"}</p>
          </div>
        </div>
      )}

      {/* ── Active question ───────────────────────────────────────────── */}
      {!loading && question && (
        <div className="flex flex-1 gap-5 lg:gap-8">
          {/* Left: contextual image panel */}
          <div className="hidden lg:flex lg:w-[38%] flex-col gap-4">
            <div
              className="relative flex-1 overflow-hidden rounded-3xl"
              style={{ boxShadow: "0 8px 40px 0 oklch(0 0 0 / 0.5)" }}
            >
              <img
                key={sideImg}
                src={sideImg}
                alt=""
                aria-hidden="true"
                className="size-full object-cover transition-opacity duration-500"
                style={{ filter: "brightness(0.75) saturate(0.85)" }}
              />
              {/* Gradient overlay so text can sit on it */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, oklch(0.10 0.04 258 / 0.95) 0%, transparent 55%)",
                }}
              />
              {/* Progress pips at the bottom of the image */}
              <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2" aria-hidden="true">
                {questions.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "block h-1.5 rounded-full transition-all duration-500",
                      i === index ? "w-8 bg-primary" : i < index ? "w-4 bg-primary/60" : "w-4 bg-white/20",
                    )}
                  />
                ))}
              </div>
              {/* Card count */}
              <div className="absolute top-5 left-5">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-sm">
                  {t("kiosk.nav.card", { current: index + 1, total: questions.length })}
                </span>
              </div>
            </div>
            {/* Mic hint */}
            <div
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-sm"
              style={{ boxShadow: "0 2px 12px 0 oklch(0 0 0 / 0.3)" }}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/20">
                <Mic className="size-4 text-primary" />
              </span>
              <p className={cn("text-xs leading-snug text-white/60", language === "hi" && "deva")}>
                {t("kiosk.voice.note")}
              </p>
            </div>
          </div>

          {/* Right: question + voice interaction */}
          <div className="flex flex-1 flex-col gap-3 min-w-0">
            {/* Heading + progress (mobile only shows progress here) */}
            <div className="animate-rise">
              <KioskText
                tkey="kiosk.questions.heading"
                as="h1"
                className="text-xl font-semibold text-white sm:text-2xl"
                secondaryClassName="text-base font-normal text-white/70"
              />
              {/* Mobile progress pips */}
              <div className="mt-2 flex gap-1.5 lg:hidden" aria-hidden="true">
                {questions.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors duration-300",
                      i <= index ? "bg-primary" : "bg-white/15",
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Fallback notice */}
            {usedFallback && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-sm">
                <p className={cn("text-sm text-white/60", language === "hi" && "deva")}>
                  {t("kiosk.questions.problem")}
                </p>
                <button
                  type="button"
                  onClick={() => void prepareQuestions()}
                  className="min-h-9 rounded-full border border-white/15 bg-white/10 px-4 text-xs font-semibold text-white hover:bg-white/20"
                >
                  <span className={cn(language === "hi" && "deva")}>{t("kiosk.questions.retry")}</span>
                </button>
              </div>
            )}

            {/* Voice answer card */}
            <div key={question.id} className="animate-rise flex-1">
              <KioskVoiceAnswer
                key={question.id}
                questionText={question.text}
                answer={answers[question.id]}
                onAnswer={handleAnswer}
              />
            </div>

            {/* Navigation */}
            {isLast ? (
              <KioskStepNav
                stepId="questions"
                canContinue={Boolean(answers[question.id])}
                onBack={index > 0 ? () => setIndex((c) => c - 1) : undefined}
                onContinue={async () => {
                  const currentAnswer = answers[question.id];
                  if (currentAnswer) {
                    await patientKioskApi.saveAnswer(question.id, currentAnswer, "voice", question.text);
                  }
                  await updateSession({ answers });
                }}
              />
            ) : (
              <KioskStepNav
                stepId="questions"
                continueKey="kiosk.questions.next"
                canContinue={Boolean(answers[question.id])}
                onBack={index > 0 ? () => setIndex((c) => c - 1) : undefined}
                onContinue={async () => {
                  const currentAnswer = answers[question.id];
                  if (currentAnswer) {
                    await patientKioskApi.saveAnswer(question.id, currentAnswer, "voice", question.text);
                  }
                  setIndex((current) => current + 1);
                  return false;
                }}
              />
            )}
          </div>
        </div>
      )}
    </KioskStepContainer>
  );
}
