import { media } from "@/features/landing/content";
import { useLanguage } from "@/lib/language";
import { Bi, Eyebrow, Reveal, Section, SectionHeading } from "./section-kit";

const provenance = [
  { hi: "मूल दस्तावेज़", en: "Source document" },
  { hi: "प्रोसेस किया गया", en: "Processed" },
  { hi: "समीक्षा के लिए", en: "Reviewed by clinician" },
] as const;

const kinds = [
  { hi: "पर्ची", en: "Prescription" },
  { hi: "जाँच रिपोर्ट", en: "Lab report" },
  { hi: "पुराना रिकॉर्ड", en: "Past record" },
  { hi: "स्कैन की गई कॉपी", en: "Scanned copy" },
] as const;

export function DocumentsSection() {
  const { hi, en } = useLanguage();

  return (
    <Section labelledBy="documents-title" id="documents">
      <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">
        <div>
          <Reveal>
            <Eyebrow hi="दस्तावेज़" en="Documents & history" />
            <SectionHeading
              id="documents-title"
              hi="पुरानी रिपोर्टें भी साथ रखें।"
              en="Bring your earlier reports along."
            />
            <Bi
              as="p"
              className="mt-7 max-w-xl text-lg leading-relaxed"
              hiClassName="text-foreground"
              enClassName="mt-3 text-base"
              hi="ज़रूरी दस्तावेज़ों को सुरक्षित तरीके से केस के साथ जोड़ा जा सकता है।"
              en="Relevant documents can be attached securely to the case."
            />
          </Reveal>

          <Reveal delay={110} className="mt-8">
            <ul className="flex flex-wrap gap-2.5">
              {kinds.map((k) => (
                <li
                  key={k.en}
                  className="rounded-full border border-border bg-surface px-4 py-2 text-base"
                >
                  {hi && (
                    <span lang="hi" className="deva">
                      {k.hi}
                    </span>
                  )}
                  {hi && en && (
                    <span aria-hidden="true" className="px-2 opacity-40">
                      ·
                    </span>
                  )}
                  {en && (
                    <span lang="en" className={hi ? "text-sm text-muted-foreground" : ""}>
                      {k.en}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={180} className="mt-10">
            <ol className="grid gap-3 sm:grid-cols-3">
              {provenance.map((p, i) => (
                <li key={p.en} className="surface-panel rounded-3xl px-5 py-4">
                  <span
                    aria-hidden="true"
                    className="text-xs font-semibold tracking-[0.2em] text-primary"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Bi
                    className="mt-2 text-base font-semibold leading-snug"
                    enClassName="mt-1 text-sm font-medium"
                    hi={p.hi}
                    en={p.en}
                  />
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <Reveal delay={90}>
          <figure className="media-frame">
            <img
              src={media.documents.poster}
              alt={hi && !en ? media.documents.altHi : media.documents.alt}
              width={media.documents.width}
              height={media.documents.height}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </figure>
        </Reveal>
      </div>
    </Section>
  );
}
