import { useLanguage } from "@/lib/language";
import { media } from "@/features/landing/content";
import { Bi, Eyebrow, Reveal, Section, SectionHeading } from "./section-kit";

const rows = [
  {
    hi: "मरीज़ की परेशानी",
    en: "Patient concern",
    valueHi: "पेट में दर्द · 4 दिन",
    valueEn: "Abdominal pain · 4 days",
  },
  {
    hi: "पुष्ट जवाब",
    en: "Confirmed answers",
    valueHi: "6 सवालों के जवाब",
    valueEn: "6 questions answered",
  },
  {
    hi: "ज़रूरी इतिहास",
    en: "Relevant history",
    valueHi: "अम्लता, पहले की पर्ची",
    valueEn: "Acidity, earlier prescription",
  },
  { hi: "दस्तावेज़", en: "Documents", valueHi: "2 जोड़े गए", valueEn: "2 attached" },
  {
    hi: "ध्यान देने योग्य",
    en: "Needs attention",
    valueHi: "1 संकेत",
    valueEn: "1 flag for review",
  },
] as const;

export function ClinicianHandoff() {
  const { hi, en } = useLanguage();

  return (
    <Section labelledBy="staff-title" id="for-staff" tone="sunken">
      <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-20">
        <div>
          <Reveal>
            <Eyebrow hi="चिकित्सक तक" en="Clinician handoff" />
            <SectionHeading
              id="staff-title"
              hi="डॉक्टर से मिलने से पहले कहानी तैयार।"
              en="The story is ready before the consultation begins."
            />
            <Bi
              as="p"
              className="mt-7 max-w-xl text-lg leading-relaxed"
              hiClassName="text-foreground"
              enClassName="mt-3 text-base"
              hi="डॉक्टर को शुरुआत से सब कुछ दोबारा पूछने की ज़रूरत कम हो सकती है — ताकि बातचीत ज़रूरत के अनुसार आगे बढ़ सके।"
              en="Less needs to be asked from scratch, so the consultation can move to what matters."
            />
          </Reveal>

          <Reveal delay={140} className="mt-10">
            <figure className="media-frame">
              <img
                src={media.doctor.poster}
                alt={hi && !en ? media.doctor.altHi : media.doctor.alt}
                width={media.doctor.width}
                height={media.doctor.height}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover"
              />
            </figure>
          </Reveal>
        </div>

        {/* Clinician-side view — presentation mock, no real patient data. */}
        <Reveal delay={90}>
          <div className="surface-panel overflow-hidden rounded-[var(--radius-4xl)]">
            <div className="flex items-center justify-between gap-4 border-b border-border/70 bg-surface-sunken px-6 py-4">
              <Bi
                className="text-sm font-semibold"
                enClassName="text-xs uppercase tracking-[0.16em]"
                hi="केस सारांश"
                en="Case summary"
              />
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                {hi && (
                  <span lang="hi" className="deva">
                    समीक्षा के लिए तैयार
                  </span>
                )}
                {!hi && <span lang="en">Ready for review</span>}
              </span>
            </div>
            <dl className="divide-y divide-border/70 px-6">
              {rows.map((r) => (
                <div
                  key={r.en}
                  className="grid gap-1 py-4 sm:grid-cols-2 sm:items-baseline sm:gap-4"
                >
                  <dt className="text-sm">
                    {hi && (
                      <span lang="hi" className="deva block text-muted-foreground">
                        {r.hi}
                      </span>
                    )}
                    {en && (
                      <span
                        lang="en"
                        className="block text-xs uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        {r.en}
                      </span>
                    )}
                  </dt>
                  <dd className="text-base font-semibold">
                    {hi && (
                      <span lang="hi" className="deva block">
                        {r.valueHi}
                      </span>
                    )}
                    {en && (
                      <span
                        lang="en"
                        className={hi ? "block text-sm font-medium text-muted-foreground" : "block"}
                      >
                        {r.valueEn}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="border-t border-border/70 bg-surface-sunken px-6 py-4">
              <Bi
                className="text-sm leading-snug"
                enClassName="mt-1 text-xs"
                hi="अंतिम व्याख्या और निर्णय चिकित्सक का।"
                en="Interpretation and decisions remain with the clinician."
              />
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
