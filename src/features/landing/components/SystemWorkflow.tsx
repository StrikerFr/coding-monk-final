import { useLanguage } from "@/lib/language";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";
import { Bi, Eyebrow, Reveal, Section, SectionHeading } from "./section-kit";

const stages = [
  { hi: "मरीज़", en: "Patient" },
  { hi: "बोलकर या छूकर", en: "Voice or touch" },
  { hi: "व्यवस्थित intake", en: "Structured intake" },
  { hi: "दस्तावेज़", en: "Documents" },
  { hi: "सुरक्षा जाँच", en: "Safety checks" },
  { hi: "चिकित्सक समीक्षा", en: "Clinician review" },
  { hi: "हस्ताक्षरित रिकॉर्ड", en: "Signed record" },
] as const;

export function SystemWorkflow() {
  const { hi, en } = useLanguage();
  const { ref, shown } = useReveal<HTMLOListElement>(0.12);

  return (
    <Section labelledBy="workflow-title" id="workflow">
      <Reveal className="mx-auto max-w-3xl text-center">
        <Eyebrow hi="पूरी यात्रा" en="The whole journey" />
        <SectionHeading
          id="workflow-title"
          hi="मरीज़ की बात से चिकित्सकीय रिकॉर्ड तक।"
          en="From the patient's words to a signed clinical record."
        />
      </Reveal>

      <ol ref={ref} className="mt-14 flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-0">
        {stages.map((s, i) => (
          <li key={s.en} className="flex min-w-0 flex-1 items-center gap-3 lg:flex-col lg:gap-0">
            <div
              className={cn(
                "flex flex-1 items-center gap-4 rounded-[var(--radius-3xl)] border border-border bg-surface px-5 py-4 transition-all duration-700 ease-[var(--ease-calm)] lg:w-full lg:flex-none lg:flex-col lg:gap-3 lg:px-4 lg:py-6 lg:text-center",
                shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              )}
              style={{ transitionDelay: `${i * 110}ms` }}
            >
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <Bi
                className="min-w-0 text-base font-semibold leading-snug"
                enClassName="mt-0.5 text-xs font-medium uppercase tracking-[0.12em]"
                hi={s.hi}
                en={s.en}
              />
            </div>
            {i < stages.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "shrink-0 bg-primary-soft transition-transform duration-700 ease-[var(--ease-calm)]",
                  "ml-5 h-4 w-px origin-top lg:ml-0 lg:h-px lg:w-6 lg:origin-left lg:self-center",
                  shown ? "scale-y-100 lg:scale-x-100" : "scale-y-0 lg:scale-y-100 lg:scale-x-0",
                )}
                style={{ transitionDelay: `${80 + i * 110}ms` }}
              />
            )}
          </li>
        ))}
      </ol>

      <Reveal delay={120} className="mt-12">
        <details className="mx-auto max-w-3xl rounded-[var(--radius-3xl)] border border-border bg-surface px-6 py-5">
          <summary className="cursor-pointer list-none text-base font-semibold">
            {hi && (
              <span lang="hi" className="deva">
                पर्दे के पीछे यह कैसे काम करता है →
              </span>
            )}
            {hi && en && (
              <span aria-hidden="true" className="px-2 opacity-40">
                ·
              </span>
            )}
            {en && (
              <span lang="en" className={hi ? "text-sm text-muted-foreground" : ""}>
                How it works behind the scenes →
              </span>
            )}
          </summary>
          <Bi
            as="p"
            className="mt-4 text-base leading-relaxed"
            hiClassName="text-foreground"
            enClassName="mt-2 text-sm"
            hi="मरीज़ की बात दर्ज होती है, आसान सवालों से पूरी होती है, दस्तावेज़ जुड़ते हैं, ज़रूरी संकेत अलग किए जाते हैं और फिर सब कुछ चिकित्सक की समीक्षा के लिए जाता है। रिकॉर्ड तभी पूरा माना जाता है जब चिकित्सक उसकी पुष्टि करते हैं।"
            en="The conversation is captured, completed with simple follow-up questions, enriched with documents, checked for signals that need attention, and then handed to a clinician. A record is final only once the clinician confirms it."
          />
        </details>
      </Reveal>
    </Section>
  );
}
