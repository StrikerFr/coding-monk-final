import { media, patients } from "@/features/landing/content";
import { useLanguage } from "@/lib/language";
import { Bi, Eyebrow, Reveal, Section, SectionHeading } from "./section-kit";

export function AudienceSection() {
  const { hi, en } = useLanguage();

  const groups = [
    {
      hi: "मरीज़",
      en: "Patients",
      bodyHi: "अपनी बात आसानी से बताएं।",
      bodyEn: "Say what's wrong, simply.",
      image: patients[0],
    },
    {
      hi: "चिकित्सक",
      en: "Clinicians",
      bodyHi: "केस को व्यवस्थित रूप में देखें।",
      bodyEn: "See the case already organised.",
      image: { poster: media.doctor.poster, alt: media.doctor.alt, altHi: media.doctor.altHi },
    },
    {
      hi: "नर्स और स्टाफ़",
      en: "Nurses and staff",
      bodyHi: "तेज़ और स्पष्ट intake।",
      bodyEn: "A faster, clearer intake step.",
      image: patients[3],
    },
    {
      hi: "स्वास्थ्य संस्थान",
      en: "Healthcare institutions",
      bodyHi: "एक व्यवस्थित डिजिटल case-taking परत।",
      bodyEn: "A consistent digital case-taking layer.",
      image: patients[2],
    },
  ];

  return (
    <Section labelledBy="audience-title" id="audience">
      <Reveal className="max-w-3xl">
        <Eyebrow hi="किनके लिए" en="Who it's for" />
        <SectionHeading
          id="audience-title"
          hi="मेडिकिओस्क किनके लिए है।"
          en="Who MediKiosk is for."
        />
      </Reveal>

      <ul className="mt-14 grid gap-6 sm:grid-cols-2">
        {groups.map((g, i) => (
          <Reveal key={g.en} as="li" delay={i * 100} className="min-w-0">
            <article className="grid h-full gap-6 rounded-[var(--radius-4xl)] border border-border bg-surface p-4 shadow-[var(--shadow-soft)] sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-center">
              <figure className="media-frame">
                <img
                  src={g.image.poster}
                  alt={hi && !en ? g.image.altHi : g.image.alt}
                  width={896}
                  height={1152}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover"
                />
              </figure>
              <div className="px-2 pb-3 sm:pb-0 sm:pr-4">
                <Bi
                  className="text-xl font-semibold leading-snug"
                  enClassName="mt-1 text-sm font-medium uppercase tracking-[0.14em]"
                  hi={g.hi}
                  en={g.en}
                />
                <Bi
                  as="p"
                  className="mt-4 text-base leading-relaxed"
                  hiClassName="text-foreground"
                  enClassName="mt-1 text-sm"
                  hi={g.bodyHi}
                  en={g.bodyEn}
                />
              </div>
            </article>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
