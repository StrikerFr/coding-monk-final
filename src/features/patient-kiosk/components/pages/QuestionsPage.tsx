import { useCallback, useEffect, useRef, useState } from "react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { patientKioskApi } from "@/features/patient-kiosk/api";
import { stepNumber } from "@/features/patient-kiosk/session";
import { KioskStepContainer } from "../KioskStepContainer";
import { KioskStepNav } from "../KioskStepNav";
import { KioskText } from "../KioskText";
import { KioskVoiceAnswer } from "../KioskVoiceAnswer";
import { cn } from "@/lib/utils";
import type { ClinicalFollowUpQuestion } from "@/lib/clinical/types";

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

function fallbackQuestions(language: "hi" | "en"): ClinicalFollowUpQuestion[] {
  return FALLBACK[language].map((text, index) => ({ id: `clinical-fallback-${index + 1}`, text }));
}

/** The spoken part of check-in: three questions, answered by speaking. */
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
    <KioskStepContainer step={stepNumber("questions")}>
      <div className="mx-auto max-w-3xl">
        <KioskText
          tkey="kiosk.questions.heading"
          as="h1"
          className="text-3xl font-semibold sm:text-4xl"
          secondaryClassName="text-xl font-normal"
        />
        <KioskText
          tkey="kiosk.questions.support"
          as="p"
          className="mt-4 text-lg leading-relaxed text-muted-foreground"
        />

        {loading && (
          <div role="status" aria-live="polite" className="mt-10 rounded-3xl border border-border bg-surface px-6 py-10 text-center">
            <p className={cn("text-xl font-semibold", language === "hi" && "deva")}>
              {t("kiosk.questions.preparing")}
            </p>
          </div>
        )}

        {!loading && usedFallback && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-muted px-5 py-4">
            <p className={cn("text-base text-muted-foreground", language === "hi" && "deva")}>
              {t("kiosk.questions.problem")}
            </p>
            <button
              type="button"
              onClick={() => void prepareQuestions()}
              className="min-h-12 rounded-full border border-border bg-background px-6 text-base font-semibold hover:bg-muted"
            >
              <span className={cn(language === "hi" && "deva")}>{t("kiosk.questions.retry")}</span>
            </button>
          </div>
        )}

        {question && (
          <>
            <div className="mt-8">
              <KioskVoiceAnswer
                key={question.id}
                questionText={question.text}
                answer={answers[question.id]}
                onAnswer={handleAnswer}
              />
            </div>

            {isLast ? (
              <KioskStepNav
                stepId="questions"
                canContinue={Boolean(answers[question.id])}
                note="kiosk.voice.note"
                onContinue={() => updateSession({ answers })}
              />
            ) : (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <KioskText
                  tkey="kiosk.voice.note"
                  as="p"
                  className="max-w-md text-base text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setIndex((current) => current + 1)}
                  disabled={!answers[question.id]}
                  className={cn(
                    "inline-flex min-h-16 items-center rounded-full bg-primary px-10 text-xl font-semibold text-primary-foreground",
                    "shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50",
                  )}
                >
                  <span className={cn(language === "hi" && "deva")}>
                    {t("kiosk.questions.next")}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </KioskStepContainer>
  );
}
