import { useLanguage } from "@/lib/language";
import { media } from "@/features/landing/content";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

export function ClosingSection() {
  const { hi, en } = useLanguage();
  const { ref, shown } = useReveal<HTMLDivElement>(0.2);

  return (
    <section
      className="relative overflow-hidden px-6 pb-20 pt-4 sm:px-10 lg:px-16 lg:pb-28"
      aria-labelledby="closing-title"
    >
      <div ref={ref} className={cn("reveal relative mx-auto max-w-[1500px]", shown && "reveal-in")}>
        <div className="media-frame grid place-items-center ring-1 ring-border/60">
          <img
            src={media.closing.poster}
            alt={hi && !en ? media.closing.altHi : media.closing.alt}
            width={media.closing.width}
            height={media.closing.height}
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-background/78" />
          <span
            aria-hidden="true"
            className="organic-blob -left-20 bottom-0 size-[24rem] bg-primary-soft/40"
          />

          <div className="relative px-8 py-20 text-center lg:py-32">
            <h2
              id="closing-title"
              className="mx-auto max-w-4xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-[3.25rem]"
            >
              {hi && (
                <span className="deva block">
                  हर आवाज़,
                  <br />
                  बेहतर स्वास्थ्य की ओर एक कदम।
                </span>
              )}
              {en && (
                <span
                  className={
                    hi
                      ? "mt-5 block text-xl font-medium text-muted-foreground sm:text-2xl lg:text-3xl"
                      : "block"
                  }
                >
                  Every voice is a step towards a healthier India.
                </span>
              )}
            </h2>
            <span
              aria-hidden="true"
              className="mx-auto mt-10 block h-px w-24 bg-[linear-gradient(to_right,transparent,var(--color-primary-soft),transparent)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
