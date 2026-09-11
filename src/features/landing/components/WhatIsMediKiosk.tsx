import { useLanguage } from "@/lib/language";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";
import { Bi, Eyebrow, Reveal, Section, SectionHeading } from "./section-kit";
import { SoundWave } from "./SoundWave";

const nodes = [
  {
    hi: "मरीज़",
    en: "Patient",
    detailHi: "अपनी परेशानी अपने शब्दों में बताते हैं।",
    detailEn: "Shares the concern in their own words.",
  },
  {
    hi: "मेडिकिओस्क",
    en: "MediKiosk",
    detailHi: "आसान सवाल पूछकर जानकारी व्यवस्थित करता है।",
    detailEn: "Asks simple questions and organises the answers.",
  },
  {
    hi: "चिकित्सक",
    en: "Clinician",
    detailHi: "व्यवस्थित जानकारी के साथ बातचीत शुरू करते हैं।",
    detailEn: "Begins the consultation with a structured case.",
  },
] as const;

export function WhatIsMediKiosk() {
  const { hi, en } = useLanguage();
  const { ref, shown } = useReveal<HTMLDivElement>(0.2);

  return (
    <Section labelledBy="about-title" id="what-is-medikiosk">
      <span
        aria-hidden="true"
        className="organic-blob -left-24 top-8 size-[24rem] bg-primary-soft/35"
      />

      <Reveal className="mx-auto max-w-3xl text-center">
        <Eyebrow hi="मेडिकिओस्क" en="MediKiosk" />
        <SectionHeading
          id="about-title"
          hi="स्वास्थ्य की पहली बातचीत, अब आसान।"
          en="A simpler way to begin your healthcare journey."
        />
        <Bi
          as="p"
          className="mt-7 text-xl leading-relaxed"
          hiClassName="text-foreground"
          enClassName="mt-3 text-lg"
          hi="डॉक्टर से मिलने से पहले मेडिकिओस्क आपसे आसान सवाल पूछता है, आपकी बात आपके शब्दों में दर्ज करता है और उसे व्यवस्थित रूप में तैयार करता है।"
          en="Before you meet the clinician, MediKiosk guides a short voice-first conversation, captures your own words and organises them for clinical review."
        />
      </Reveal>

      {/* One large visual instead of a grid of feature cards. */}
      <div ref={ref} className={cn("reveal mt-16 lg:mt-20", shown && "reveal-in")}>
        <div className="surface-panel relative overflow-hidden rounded-[var(--radius-4xl)] px-6 py-12 sm:px-12 lg:px-16 lg:py-16">
          <ol className="relative grid gap-10 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center lg:gap-6">
            {nodes.map((node, i) => (
              <li key={node.en} className="contents">
                <div className="text-center">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mx-auto grid size-20 place-items-center rounded-full transition-all duration-700 ease-[var(--ease-calm)] sm:size-24",
                      i === 1
                        ? "bg-primary/12 ring-1 ring-primary/25"
                        : "bg-surface-sunken ring-1 ring-border",
                      shown ? "scale-100 opacity-100" : "scale-90 opacity-0",
                    )}
                    style={{ transitionDelay: `${i * 180}ms` }}
                  >
                    {i === 1 ? (
                      <SoundWave active={shown} className="h-8" />
                    ) : i === 0 ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="size-9 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      >
                        <circle cx="12" cy="8" r="3.6" />
                        <path d="M5 20a7 7 0 0 1 14 0" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="size-9 text-secondary"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 4h7l4 4v12H7z" />
                        <path d="M10 12h5M10 16h4" />
                      </svg>
                    )}
                  </span>
                  <p className="mt-5 text-xl font-semibold">
                    {hi && (
                      <span lang="hi" className="deva block">
                        {node.hi}
                      </span>
                    )}
                    {en && (
                      <span
                        lang="en"
                        className={
                          hi
                            ? "block text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground"
                            : "block"
                        }
                      >
                        {node.en}
                      </span>
                    )}
                  </p>
                  <Bi
                    as="p"
                    className="mx-auto mt-3 max-w-[18rem] text-base leading-relaxed"
                    hiClassName="text-foreground"
                    enClassName="mt-1 text-sm"
                    hi={node.detailHi}
                    en={node.detailEn}
                  />
                </div>

                {i < nodes.length - 1 && (
                  <div aria-hidden="true" className="flex items-center justify-center">
                    <span
                      className={cn(
                        "block bg-[linear-gradient(to_bottom,transparent,var(--color-primary-soft),transparent)] transition-transform duration-1000 ease-[var(--ease-calm)]",
                        "h-12 w-px origin-top lg:h-px lg:w-24 lg:origin-left lg:bg-[linear-gradient(to_right,transparent,var(--color-primary-soft),transparent)]",
                        shown
                          ? "scale-y-100 lg:scale-x-100"
                          : "scale-y-0 lg:scale-y-100 lg:scale-x-0",
                      )}
                      style={{ transitionDelay: `${240 + i * 220}ms` }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
