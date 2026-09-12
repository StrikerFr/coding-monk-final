import { media } from "@/features/landing/content";
import { useLanguage } from "@/lib/language";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";
import { Bi } from "./section-kit";

/** Cinematic visual pause before the final call to action. Very little text. */
export function BuiltWithCare() {
  const { hi, en } = useLanguage();
  const { ref, shown } = useReveal<HTMLDivElement>(0.15);

  return (
    <section className="px-6 py-16 sm:px-10 lg:px-16 lg:py-24" aria-labelledby="care-title">
      <div ref={ref} className={cn("reveal mx-auto max-w-[1400px]", shown && "reveal-in")}>
        <figure className="media-frame grid place-items-center">
          <img
            src={media.cinematic.poster}
            alt={hi && !en ? media.cinematic.altHi : media.cinematic.alt}
            width={media.cinematic.width}
            height={media.cinematic.height}
            loading="lazy"
            className={cn(
              "absolute inset-0 size-full object-cover transition-transform duration-[2200ms] ease-[var(--ease-calm)]",
              shown ? "scale-100" : "scale-105",
            )}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-foreground/45" />
          <figcaption className="relative px-8 py-24 text-center text-background lg:py-40">
            <h2
              id="care-title"
              className="mx-auto max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-[3rem]"
            >
              {en && (
                <span lang="en" className="block">
                  Technology should make healthcare feel more human.
                </span>
              )}
              {hi && (
                <span
                  lang="hi"
                  className={
                    en ? "deva mt-5 block text-xl font-medium opacity-85 sm:text-2xl" : "deva block"
                  }
                >
                  तकनीक ऐसी, जो देखभाल को और मानवीय बनाए।
                </span>
              )}
            </h2>
            <Bi
              as="p"
              className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed opacity-90"
              hiClassName="text-background"
              enClassName="mt-2 text-base text-background/80"
              hi="मेडिकिओस्क मरीज़, चिकित्सक और उनके बीच की बातचीत के आसपास बनाया गया है।"
              en="MediKiosk is designed around the patient, the clinician and the conversation between them."
            />
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
