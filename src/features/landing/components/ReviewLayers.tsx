import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";
import { Bi, Eyebrow, Reveal, Section, SectionHeading } from "./section-kit";

const layers = [
  {
    hi: "पुष्ट जानकारी",
    en: "Confirmed information",
    bodyHi: "जो मरीज़ ने खुद बताया और पुष्टि की।",
    bodyEn: "What the patient said and confirmed.",
    tone: "confirmed",
  },
  {
    hi: "सहायक प्रमाण",
    en: "Supporting evidence",
    bodyHi: "दस्तावेज़ और मूल सामग्री।",
    bodyEn: "Documents and source material.",
    tone: "evidence",
  },
  {
    hi: "मसौदा जानकारी",
    en: "Draft, assisted information",
    bodyHi: "जिसे चिकित्सक की समीक्षा चाहिए।",
    bodyEn: "Needs clinical review before it counts.",
    tone: "draft",
  },
  {
    hi: "चिकित्सक का निर्णय",
    en: "Clinician decision",
    bodyHi: "अंतिम चिकित्सकीय व्याख्या चिकित्सक की।",
    bodyEn: "The final clinical interpretation is the clinician's.",
    tone: "decision",
  },
] as const;

const toneClass: Record<string, string> = {
  confirmed: "border-secondary/35 bg-accent/45",
  evidence: "border-border bg-surface",
  draft: "border-primary/25 bg-primary/8",
  decision: "border-foreground/20 bg-surface-sunken",
};

export function ReviewLayers() {
  const { hi, en } = useLanguage();

  return (
    <Section labelledBy="review-title" id="review-layers">
      <Reveal className="mx-auto max-w-3xl text-center">
        <Eyebrow hi="स्पष्टता" en="Clinical clarity" />
        <SectionHeading
          id="review-title"
          hi="हर जानकारी एक जैसी नहीं होती।"
          en="Not all information carries the same weight."
        />
      </Reveal>

      <ol className="mt-14 grid gap-5 lg:grid-cols-4">
        {layers.map((l, i) => (
          <Reveal key={l.en} as="li" delay={i * 110} className="min-w-0">
            <div
              className={cn(
                "flex h-full flex-col rounded-[var(--radius-3xl)] border px-6 py-7",
                toneClass[l.tone],
              )}
            >
              <span
                aria-hidden="true"
                className="text-xs font-semibold tracking-[0.2em] text-muted-foreground"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <Bi
                className="mt-3 text-lg font-semibold leading-snug"
                enClassName="mt-1 text-sm font-medium"
                hi={l.hi}
                en={l.en}
              />
              <Bi
                as="p"
                className="mt-4 text-base leading-relaxed"
                hiClassName="text-foreground"
                enClassName="mt-1 text-sm"
                hi={l.bodyHi}
                en={l.bodyEn}
              />
              {/* Layer weight is shown by position and label, never colour alone. */}
              <span aria-hidden="true" className="mt-6 flex gap-1">
                {[0, 1, 2, 3].map((d) => (
                  <span
                    key={d}
                    className={cn(
                      "h-1 flex-1 rounded-full",
                      d <= i ? "bg-foreground/45" : "bg-foreground/12",
                    )}
                  />
                ))}
              </span>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal delay={140} className="mx-auto mt-10 max-w-2xl text-center">
        <Bi
          as="p"
          className="text-base leading-relaxed"
          hiClassName="text-foreground"
          enClassName="mt-1.5 text-sm"
          hi="मेडिकिओस्क जानकारी तैयार करता है — निदान नहीं करता।"
          en={
            en && !hi
              ? "MediKiosk prepares information. It does not diagnose."
              : "MediKiosk prepares information for review. It does not diagnose."
          }
        />
      </Reveal>
    </Section>
  );
}
