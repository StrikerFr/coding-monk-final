import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";
import { Bi, Eyebrow, Reveal, Section, SectionHeading } from "./section-kit";

const stages = [
  { hi: "मरीज़ की जानकारी", en: "Patient information" },
  { hi: "सुरक्षा जाँच", en: "Safety checks" },
  { hi: "चिकित्सक का ध्यान", en: "Clinician attention" },
] as const;

export function SafetySection() {
  const { ref, shown } = useReveal<HTMLOListElement>(0.2);

  return (
    <Section labelledBy="safety-title" id="safety" tone="sunken">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
        <Reveal>
          <Eyebrow hi="सुरक्षा" en="Safety" />
          <SectionHeading
            id="safety-title"
            hi="जहाँ ज़रूरी हो, सुरक्षा पहले।"
            en="When something needs attention, it is surfaced early."
          />
          <Bi
            as="p"
            className="mt-7 max-w-xl text-lg leading-relaxed"
            hiClassName="text-foreground"
            enClassName="mt-3 text-base"
            hi="सिस्टम संकेत दे सकता है। अंतिम निर्णय चिकित्सक का है।"
            en="MediKiosk can surface a signal for clinical attention. The decision stays with the clinician."
          />
        </Reveal>

        <ol ref={ref} className="grid gap-4">
          {stages.map((s, i) => (
            <li key={s.en}>
              <div
                className={cn(
                  "surface-panel flex items-center gap-5 rounded-[var(--radius-3xl)] px-6 py-6 transition-all duration-700 ease-[var(--ease-calm)]",
                  shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                )}
                style={{ transitionDelay: `${i * 160}ms` }}
              >
                <span
                  aria-hidden="true"
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-base font-semibold text-accent-foreground"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Bi
                  className="text-lg font-semibold leading-snug"
                  enClassName="mt-1 text-sm font-medium"
                  hi={s.hi}
                  en={s.en}
                />
              </div>
              {i < stages.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mx-auto block h-6 w-px origin-top bg-[linear-gradient(to_bottom,var(--color-primary-soft),transparent)] transition-transform duration-700 ease-[var(--ease-calm)]",
                    shown ? "scale-y-100" : "scale-y-0",
                  )}
                  style={{ transitionDelay: `${120 + i * 160}ms` }}
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
