import { useState } from "react";
import { useLanguage } from "@/lib/language";
import { media } from "@/features/landing/content";

import { HumanVideo } from "./HumanVideo";
import { PrimaryStartButton } from "./PrimaryStartButton";
import { SoundWave } from "./SoundWave";
import { TrustCues } from "./TrustCues";

export function HeroExperience({ onStart }: { onStart: () => void }) {
  const { hi, en } = useLanguage();
  const [state, setState] = useState<"rest" | "attentive" | "listening">("rest");

  const start = () => {
    setState("listening");
    window.setTimeout(onStart, 520);
  };

  return (
    <section className="relative overflow-hidden px-6 pb-14 pt-10 sm:px-10 lg:px-16 lg:pb-20 lg:pt-14">
      {/* Soft organic brand light — decorative only */}
      <span
        aria-hidden="true"
        className="organic-blob -left-24 top-10 size-[26rem] bg-primary-soft/45"
      />
      <span
        aria-hidden="true"
        className="organic-blob -right-32 bottom-0 size-[30rem] bg-accent/50"
      />

      <div className="relative mx-auto grid max-w-[1500px] items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        {/* Left: the human + listening visual do most of the talking */}
        <div className="animate-rise relative" style={{ animationDelay: "120ms" }}>
          <div className="group relative">
            <HumanVideo
              poster={media.hero.poster}
              posterAlt={hi && !en ? media.hero.altHi : media.hero.alt}
              src={media.hero.video}
              width={media.hero.width}
              height={media.hero.height}
              eager
              zoomOnHover
              className="aspect-[4/3] w-full"
            />

            {/* Speech cue — clean listening badge with the equaliser inside */}
            <div className="animate-float pointer-events-none absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] items-center gap-3 rounded-full border border-border/70 bg-surface/92 px-4 py-2.5 shadow-[var(--shadow-soft)] backdrop-blur-sm sm:left-7 sm:top-7 sm:px-5 sm:py-3">
              <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft sm:size-11">
                {state !== "rest" && (
                  <span
                    aria-hidden="true"
                    className="animate-cue-pulse absolute inset-0 rounded-full border-2 border-primary/40 motion-reduce:hidden"
                  />
                )}
                <SoundWave active={state !== "rest"} className="h-3.5 sm:h-4" />
              </span>
              <span className="text-base font-semibold sm:text-lg">
                {hi && <span className="deva">बस बोलकर बताइए</span>}
                {hi && en && (
                  <span aria-hidden="true" className="px-2 opacity-50">
                    /
                  </span>
                )}
                {en && <span>Just speak</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Right: very few words, one obvious action */}
        <div
          className="animate-rise flex flex-col items-center text-center lg:items-start lg:text-left"
          style={{ animationDelay: "260ms" }}
        >
          <p className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <span aria-hidden="true" className="size-2 rounded-full bg-secondary" />
            {hi && <span className="deva tracking-normal text-sm">स्वागत है</span>}
            {hi && en && (
              <span aria-hidden="true" className="opacity-40">
                ·
              </span>
            )}
            {en && <span>Welcome</span>}
          </p>

          <h1 className="text-[2.5rem] font-semibold leading-[1.1] sm:text-5xl lg:text-[4rem]">
            {hi && (
              <span className="deva block">
                आपको क्या परेशानी हो रही है,
                <br />
                हमें बताएं।
              </span>
            )}
            {en && (
              <span
                className={
                  hi
                    ? "mt-4 block text-2xl font-medium text-muted-foreground sm:text-3xl lg:text-4xl"
                    : "block"
                }
              >
                Tell us what&rsquo;s bothering you.
              </span>
            )}
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {hi && (
              <span className="deva block text-foreground">
                आपकी मुलाक़ात से पहले हम आपसे कुछ आसान सवाल पूछेंगे।
              </span>
            )}
            {en && (
              <span className={hi ? "mt-2 block text-base sm:text-lg" : "block"}>
                We&rsquo;ll ask a few simple questions before your consultation.
              </span>
            )}
          </p>

          <div className="mt-9 w-full lg:mt-10">
            <PrimaryStartButton
              onStart={start}
              onAttention={() => setState("attentive")}
              onAttentionEnd={() => setState((s) => (s === "listening" ? s : "rest"))}
              pressed={state === "listening"}
            />
          </div>

          <p className="mt-6 flex max-w-xl items-center gap-3 rounded-3xl border border-border/70 bg-surface px-5 py-4 text-left text-lg leading-relaxed shadow-[var(--shadow-soft)] sm:text-xl">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-accent"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5 text-secondary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3.5a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0v-4a3 3 0 0 1 3-3z" />
                <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
              </svg>
            </span>
            <span>
              {hi && <span className="deva block font-semibold">आप बोलकर भी बता सकते हैं।</span>}
              {en && (
                <span
                  className={hi ? "block text-base text-muted-foreground" : "block font-semibold"}
                >
                  You can speak instead of typing.
                </span>
              )}
            </span>
          </p>

          <TrustCues className="mt-8 justify-center lg:justify-start" />
        </div>
      </div>
    </section>
  );
}
