import { media } from "@/features/landing/content";
import { useLanguage } from "@/lib/language";
import { Bi, Eyebrow, Reveal, Section, SectionHeading } from "./section-kit";

const aspects = [
  { hi: "लक्षण", en: "Symptoms" },
  { hi: "पुरानी बीमारी और इतिहास", en: "History" },
  { hi: "दिनचर्या", en: "Lifestyle" },
  { hi: "खान-पान", en: "Diet" },
  { hi: "आदतें", en: "Habits" },
  { hi: "चिकित्सकीय अवलोकन", en: "Clinical observations" },
  { hi: "आयुष केस विवरण", en: "AYUSH case detail" },
] as const;

export function AyushSection() {
  const { hi, en } = useLanguage();

  return (
    <Section labelledBy="ayush-title" id="ayush">
      <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        <Reveal className="order-2 lg:order-1">
          <figure className="media-frame">
            <img
              src={media.ayush.poster}
              alt={hi && !en ? media.ayush.altHi : media.ayush.alt}
              width={media.ayush.width}
              height={media.ayush.height}
              loading="lazy"
              className="aspect-[7/5] w-full object-cover"
            />
          </figure>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <Eyebrow hi="आयुष" en="AYUSH case-taking" />
            <SectionHeading
              id="ayush-title"
              hi="आयुष की परंपरा, डिजिटल तरीके से।"
              en="A traditional case history, carefully structured."
            />
            <Bi
              as="p"
              className="mt-7 max-w-xl text-lg leading-relaxed"
              hiClassName="text-foreground"
              enClassName="mt-3 text-base"
              hi="केस की जानकारी को व्यवस्थित तरीके से समझने और दर्ज करने में मदद।"
              en="MediKiosk helps capture and organise the detail an AYUSH case history relies on."
            />
          </Reveal>

          <Reveal delay={120} className="mt-8">
            <ul className="flex flex-wrap gap-2.5">
              {aspects.map((a) => (
                <li
                  key={a.en}
                  className="rounded-full border border-secondary/25 bg-accent/50 px-4 py-2 text-base"
                >
                  {hi && (
                    <span lang="hi" className="deva">
                      {a.hi}
                    </span>
                  )}
                  {hi && en && (
                    <span aria-hidden="true" className="px-2 opacity-40">
                      ·
                    </span>
                  )}
                  {en && (
                    <span lang="en" className={hi ? "text-sm text-muted-foreground" : ""}>
                      {a.en}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={200} className="mt-8">
            <p className="surface-panel rounded-3xl px-6 py-5">
              <Bi
                className="text-base leading-relaxed"
                hiClassName="font-semibold"
                enClassName="mt-1.5 text-sm"
                hi="मेडिकिओस्क जानकारी दर्ज और व्यवस्थित करता है। चिकित्सकीय निर्णय चिकित्सक के पास ही रहता है।"
                en="MediKiosk captures and structures information. Clinical decisions remain with the clinician."
              />
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
