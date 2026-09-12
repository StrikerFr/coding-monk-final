import { useLanguage } from "@/lib/language";
import { Bi, Eyebrow, Reveal, Section, SectionHeading } from "./section-kit";

const items = [
  {
    hi: "ABHA / ABDM के अनुरूप बनावट",
    en: "ABHA / ABDM-ready architecture",
    bodyHi: "भारत के डिजिटल स्वास्थ्य ढांचे के साथ जुड़ने के लिए डिज़ाइन किया गया।",
    bodyEn: "Designed to integrate with India's digital health ecosystem.",
  },
  {
    hi: "सहमति आधारित साझा करना",
    en: "Consent-based exchange",
    bodyHi: "जानकारी सहमति के साथ ही साझा होती है।",
    bodyEn: "Health information moves only with consent.",
  },
  {
    hi: "एक-दूसरे से जुड़ने योग्य रिकॉर्ड",
    en: "Interoperable records",
    bodyHi: "व्यवस्थित रिकॉर्ड, जिन्हें आगे इस्तेमाल किया जा सके।",
    bodyEn: "Structured records that other systems can work with.",
  },
  {
    hi: "सुरक्षित कार्यप्रवाह",
    en: "Secure workflows",
    bodyHi: "पहुँच नियंत्रित और दर्ज की जाती है।",
    bodyEn: "Access is controlled and recorded.",
  },
] as const;

export function EcosystemSection() {
  return (
    <Section labelledBy="ecosystem-title" id="ecosystem">
      <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <Reveal>
          <Eyebrow hi="डिजिटल स्वास्थ्य" en="Digital health ecosystem" />
          <SectionHeading
            id="ecosystem-title"
            hi="भारत के डिजिटल स्वास्थ्य भविष्य के लिए तैयार।"
            en="Ready for India's digital health future."
          />
          <Bi
            as="p"
            className="mt-7 max-w-xl text-lg leading-relaxed"
            hiClassName="text-foreground"
            enClassName="mt-3 text-base"
            hi="मेडिकिओस्क आधुनिक स्वास्थ्य कार्यप्रवाहों के साथ काम करने के लिए बनाया गया है।"
            en="MediKiosk is built to fit into modern healthcare workflows rather than sit apart from them."
          />
        </Reveal>

        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((it, i) => (
            <Reveal key={it.en} as="li" delay={i * 100} className="min-w-0">
              <div className="surface-panel h-full rounded-[var(--radius-3xl)] px-6 py-6">
                <Bi
                  className="text-lg font-semibold leading-snug"
                  enClassName="mt-1 text-sm font-medium"
                  hi={it.hi}
                  en={it.en}
                />
                <Bi
                  as="p"
                  className="mt-4 text-base leading-relaxed"
                  hiClassName="text-foreground"
                  enClassName="mt-1 text-sm"
                  hi={it.bodyHi}
                  en={it.bodyEn}
                />
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}
