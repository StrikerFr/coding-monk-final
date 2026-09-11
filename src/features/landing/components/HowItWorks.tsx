import { useLanguage } from "@/lib/language";
import { media } from "@/features/landing/content";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";
import { VoiceVisual } from "./VoiceVisual";
import { HumanVideo } from "./HumanVideo";
import { SoundWave } from "./SoundWave";

function Connector({ shown }: { shown: boolean }) {
  return (
    <div aria-hidden="true" className="flex items-center justify-center lg:h-full">
      <span
        className={cn(
          "block origin-top bg-[linear-gradient(to_bottom,transparent,var(--color-primary-soft),transparent)] transition-transform duration-1000 ease-[var(--ease-calm)]",
          "h-14 w-px lg:h-px lg:w-full lg:origin-left lg:bg-[linear-gradient(to_right,transparent,var(--color-primary-soft),transparent)]",
          shown ? "scale-y-100 lg:scale-x-100" : "scale-y-0 lg:scale-y-100 lg:scale-x-0",
        )}
      />
    </div>
  );
}

function StepLabel({
  index,
  hiText,
  enText,
  hiSub,
  enSub,
}: {
  index: number;
  hiText: string;
  enText: string;
  hiSub: string;
  enSub: string;
}) {
  const { hi, en } = useLanguage();
  return (
    <div className="mt-6 text-center">
      <div className="flex items-baseline justify-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/12 text-base font-semibold text-primary"
        >
          {String(index).padStart(2, "0")}
        </span>
        <span>
          {hi && <span className="deva block text-2xl font-semibold lg:text-3xl">{hiText}</span>}
          {en && (
            <span
              className={
                hi
                  ? "block text-base text-muted-foreground"
                  : "block text-2xl font-semibold lg:text-3xl"
              }
            >
              {enText}
            </span>
          )}
        </span>
      </div>
      <p className="mx-auto mt-3 max-w-xs text-lg leading-relaxed">
        {hi && <span className="deva block">{hiSub}</span>}
        {en && (
          <span className={hi ? "mt-1 block text-base text-muted-foreground" : "block"}>
            {enSub}
          </span>
        )}
      </p>
    </div>
  );
}

export function HowItWorks() {
  const { hi, en } = useLanguage();
  const { ref, shown } = useReveal<HTMLOListElement>(0.15);

  const step = () => cn("reveal", shown && "reveal-in");

  const delay = (i: number) => ({ transitionDelay: `${i * 220}ms` });

  return (
    <section
      className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16 lg:py-24"
      aria-labelledby="steps-title"
    >
      <span
        aria-hidden="true"
        className="organic-blob left-1/2 top-0 size-[24rem] -translate-x-1/2 bg-primary-soft/30"
      />

      <div className="relative mx-auto max-w-[1500px]">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {hi && <span className="deva tracking-normal text-sm">कैसे काम करता है</span>}
            {hi && en && (
              <span aria-hidden="true" className="px-2 opacity-40">
                ·
              </span>
            )}
            {en && <span>How it works</span>}
          </p>
          <h2 id="steps-title" className="mt-4 text-3xl font-semibold sm:text-4xl lg:text-5xl">
            {hi && <span className="deva block">बस तीन आसान कदम।</span>}
            {en && (
              <span
                className={
                  hi ? "mt-3 block text-xl font-medium text-muted-foreground sm:text-2xl" : "block"
                }
              >
                Just three simple steps.
              </span>
            )}
          </h2>
        </div>

        <ol
          ref={ref}
          className="mt-12 grid items-start gap-4 lg:mt-16 lg:grid-cols-[1fr_auto_1fr_auto_1fr]"
        >
          <li className={step()} style={delay(0)}>
            <HumanVideo
              poster={media.speak.poster}
              posterAlt={hi && !en ? media.speak.altHi : media.speak.alt}
              src={media.speak.video}
              width={media.speak.width}
              height={media.speak.height}
              zoomOnHover
              className="group aspect-[5/6] w-full"
            />
            <StepLabel
              index={1}
              hiText="बोलें"
              enText="Speak"
              hiSub="अपनी परेशानी बताएं।"
              enSub="Tell us what's wrong."
            />
          </li>

          <Connector shown={shown} />

          <li className={step()} style={delay(1)}>
            <div className="media-frame grid aspect-[5/6] w-full place-items-center bg-[radial-gradient(circle_at_50%_40%,var(--color-surface),var(--color-surface-sunken))] ring-1 ring-border/60">
              <VoiceVisual state={shown ? "listening" : "attentive"} className="size-4/5" />
              <SoundWave active={shown} className="absolute bottom-8 h-8" />
            </div>
            <StepLabel
              index={2}
              hiText="बताएं"
              enText="Tell us"
              hiSub="हम आपके जवाब समझेंगे।"
              enSub="We'll understand your answers."
            />
          </li>

          <Connector shown={shown} />

          <li className={step()} style={delay(2)}>
            <HumanVideo
              poster={media.doctor.poster}
              posterAlt={hi && !en ? media.doctor.altHi : media.doctor.alt}
              src={media.doctor.video}
              width={media.doctor.width}
              height={media.doctor.height}
              zoomOnHover
              className="group aspect-[5/6] w-full"
            />
            <StepLabel
              index={3}
              hiText="डॉक्टर से मिलें"
              enText="Meet your doctor"
              hiSub="आपकी जानकारी डॉक्टर तक पहुंचेगी।"
              enSub="Your information reaches your doctor."
            />
          </li>
        </ol>
      </div>
    </section>
  );
}
