import { patients } from "@/features/landing/content";
import { useLanguage } from "@/lib/language";
import { Bi, Eyebrow, Reveal, Section, SectionHeading } from "./section-kit";

const tileDelay = ["delay-100", "delay-200", "delay-300", "delay-500"] as const;

export function BuiltForIndia() {
  const { hi, en } = useLanguage();

  return (
    <Section labelledBy="india-title" id="built-for-india" tone="sunken">
      <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
        <Reveal>
          <Eyebrow hi="भारत के मरीज़ों के लिए" en="Built for India" />
          <SectionHeading
            id="india-title"
            hi="हर मरीज़ अलग है। बातचीत भी होनी चाहिए।"
            en="Every patient is different. The conversation should be too."
          />
          <Bi
            as="p"
            className="mt-7 max-w-xl text-lg leading-relaxed"
            hiClassName="text-foreground"
            enClassName="mt-3 text-base"
            hi="चाहे उम्र कोई भी हो, पढ़ाई कितनी भी हो — बात करना सबसे आसान तरीका है।"
            en="Whatever a patient's age or reading comfort, speaking is the easiest way to be understood."
          />
        </Reveal>

        {/* One unified patient portrait — each scene settles smoothly into the frame. */}
        <Reveal className="min-w-0">
          <div className="patient-mosaic grid h-[34rem] grid-cols-2 grid-rows-2 gap-2 rounded-4xl border border-border bg-surface p-2 shadow-lift sm:h-[40rem] sm:gap-3 sm:p-3 lg:h-[44rem]">
            {patients.map((p, i) => (
              <figure
                key={p.en}
                className={`patient-mosaic-tile group relative min-h-0 min-w-0 overflow-hidden rounded-2xl bg-surface-sunken ${tileDelay[i]}`}
              >
                <img
                  src={p.poster}
                  alt={hi && !en ? p.altHi : p.alt}
                  width={896}
                  height={1152}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-700 ease-calm group-hover:scale-[1.025]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent"
                />
                <figcaption className="absolute inset-x-2 bottom-2 rounded-xl border border-border/60 bg-surface/95 px-3 py-2.5 shadow-soft backdrop-blur-md sm:inset-x-3 sm:bottom-3 sm:px-4 sm:py-3">
                  <Bi
                    className="text-sm font-semibold leading-snug sm:text-base"
                    enClassName="mt-0.5 text-xs font-medium sm:text-sm"
                    hi={p.hi}
                    en={p.en}
                  />
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
