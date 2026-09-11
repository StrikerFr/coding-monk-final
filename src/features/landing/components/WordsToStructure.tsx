import { useLanguage } from "@/lib/language";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";
import wordsToStructureBg from "@/assets/words-to-structure-bg.jpg";
import { Bi, Eyebrow, Reveal, Section, SectionHeading } from "./section-kit";
import { SoundWave } from "./SoundWave";

const fields = [
  { hi: "मुख्य परेशानी", en: "Chief concern", valueHi: "पेट में दर्द", valueEn: "Abdominal pain" },
  { hi: "कितने दिनों से", en: "Duration", valueHi: "4 दिन", valueEn: "4 days" },
  { hi: "लक्षण", en: "Symptoms", valueHi: "भारीपन, भूख कम", valueEn: "Heaviness, low appetite" },
  {
    hi: "पुराना इतिहास",
    en: "Relevant history",
    valueHi: "अम्लता की शिकायत",
    valueEn: "Acidity, ongoing",
  },
  {
    hi: "दवाइयाँ",
    en: "Medication",
    valueHi: "मरीज़ द्वारा बताई गई",
    valueEn: "As reported by patient",
  },
  { hi: "एलर्जी", en: "Allergies", valueHi: "कोई नहीं बताई गई", valueEn: "None reported" },
] as const;

export function WordsToStructure() {
  const { hi, en } = useLanguage();
  const { ref, shown } = useReveal<HTMLDivElement>(0.18);

  return (
    <Section
      labelledBy="structure-title"
      id="words-to-structure"
      className="isolate min-h-[900px] py-24 lg:py-32"
    >
      <img
        src={wordsToStructureBg}
        alt="A patient speaking at a health kiosk while a healthcare worker is nearby."
        width={1600}
        height={1100}
        loading="lazy"
        className="absolute inset-0 -z-30 size-full object-cover object-[67%_center]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-gradient-to-b from-background/78 via-background/58 to-background/90"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-background/95 via-background/62 to-background/15"
      />

      <Reveal className="mx-auto max-w-3xl text-center">
        <Eyebrow hi="बात से जानकारी तक" en="From words to structure" />
        <SectionHeading
          id="structure-title"
          hi="मरीज़ की बात, व्यवस्थित जानकारी।"
          en="The patient's words, carefully organised."
        />
      </Reveal>

      <div
        ref={ref}
        className="relative mt-16 grid overflow-hidden rounded-[var(--radius-4xl)] border border-background/65 bg-background/78 shadow-lift backdrop-blur-xl lg:grid-cols-[minmax(0,0.88fr)_7rem_minmax(0,1.12fr)] lg:items-stretch"
      >
        {/* Spoken words */}
        <div
          className={cn(
            "reveal flex min-h-80 flex-col justify-center px-7 py-10 sm:px-10 lg:min-h-[34rem] lg:px-12",
            shown && "reveal-in",
          )}
        >
          <div className="flex items-center gap-3 text-primary">
            <span className="grid size-11 place-items-center rounded-full bg-primary-soft/70">
              <SoundWave active={shown} className="h-4" />
            </span>
            <Bi
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              hiClassName="deva text-sm tracking-normal text-muted-foreground"
              enClassName="text-muted-foreground"
              hi="मरीज़ बोलते हैं"
              en="Patient speaks"
            />
          </div>
          <blockquote className="mt-7 text-2xl font-medium leading-relaxed sm:text-3xl">
            {hi && (
              <span lang="hi" className="deva block">
                &ldquo;मुझे पिछले कुछ दिनों से पेट में दर्द है…&rdquo;
              </span>
            )}
            {en && (
              <span
                lang="en"
                className={hi ? "mt-3 block text-lg text-muted-foreground sm:text-xl" : "block"}
              >
                &ldquo;I&rsquo;ve had stomach pain for the last few days…&rdquo;
              </span>
            )}
          </blockquote>
          <span aria-hidden="true" className="mt-8 h-px w-16 bg-primary/45" />
          <Bi
            as="p"
            className="mt-5 max-w-md text-base leading-relaxed"
            hiClassName="text-foreground"
            enClassName="mt-1 text-sm"
            hi="कुछ आसान सवाल पूछकर बात पूरी की जाती है।"
            en="A few simple follow-up questions complete the picture."
          />
        </div>

        {/* Transformation rail */}
        <div
          aria-hidden="true"
          className="relative flex min-h-20 items-center justify-center border-y border-border/60 bg-surface/45 lg:min-h-0 lg:border-x lg:border-y-0"
        >
          <div className="absolute inset-0 bg-primary-soft/20" />
          <span
            className={cn(
              "relative block bg-[linear-gradient(to_bottom,transparent,var(--color-primary),transparent)] transition-transform duration-1000 ease-[var(--ease-calm)]",
              "h-12 w-px origin-top lg:h-px lg:w-full lg:origin-left lg:bg-[linear-gradient(to_right,transparent,var(--color-primary),transparent)]",
              shown ? "scale-y-100 lg:scale-x-100" : "scale-y-0 lg:scale-y-100 lg:scale-x-0",
            )}
          />
          <span className="absolute grid size-10 place-items-center rounded-full border border-primary/25 bg-surface text-primary shadow-soft">
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
        </div>

        {/* Structured record */}
        <div
          className={cn("reveal bg-surface/88 px-7 py-10 sm:px-10 lg:px-12", shown && "reveal-in")}
          style={{ transitionDelay: "180ms" }}
        >
          <Bi
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            hiClassName="deva text-sm tracking-normal text-muted-foreground"
            enClassName="text-muted-foreground"
            hi="व्यवस्थित जानकारी"
            en="Structured information"
          />
          <dl className="mt-6 divide-y divide-border/70 border-y border-border/70">
            {fields.map((f, i) => (
              <div
                key={f.en}
                className={cn(
                  "grid gap-1 py-3 transition-all duration-700 ease-[var(--ease-calm)] sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-baseline sm:gap-4",
                  shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                )}
                style={{ transitionDelay: `${320 + i * 110}ms` }}
              >
                <dt className="text-sm">
                  {hi && (
                    <span lang="hi" className="deva block text-muted-foreground">
                      {f.hi}
                    </span>
                  )}
                  {en && (
                    <span
                      lang="en"
                      className="block text-xs uppercase tracking-[0.14em] text-muted-foreground"
                    >
                      {f.en}
                    </span>
                  )}
                </dt>
                <dd className="text-base font-semibold">
                  {hi && (
                    <span lang="hi" className="deva block">
                      {f.valueHi}
                    </span>
                  )}
                  {en && (
                    <span
                      lang="en"
                      className={hi ? "block text-sm font-medium text-muted-foreground" : "block"}
                    >
                      {f.valueEn}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 flex items-center gap-3 rounded-lg bg-accent/60 px-4 py-3 text-sm">
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-secondary" />
            <Bi
              className="leading-snug"
              enClassName="text-xs"
              hi="मरीज़ के बताए शब्दों से जुड़ा हुआ।"
              en="Every field stays linked to what the patient said."
            />
          </p>
        </div>
      </div>

      <Reveal delay={120} className="mx-auto mt-8 max-w-2xl text-center">
        <div className="inline-flex items-start gap-3 rounded-full border border-background/70 bg-background/75 px-5 py-3 shadow-soft backdrop-blur-md">
          <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-secondary" />
          <Bi
            as="p"
            className="text-left text-sm leading-relaxed"
            hiClassName="text-foreground"
            enClassName="mt-1 text-xs"
            hi="यह जानकारी चिकित्सक की समीक्षा के लिए तैयार की जाती है।"
            en="This is prepared for clinical review — not as a diagnosis."
          />
        </div>
      </Reveal>
    </Section>
  );
}
