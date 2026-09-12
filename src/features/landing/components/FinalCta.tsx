import { useState } from "react";
import { useLanguage } from "@/lib/language";
import { Bi } from "./section-kit";
import { PrimaryStartButton } from "./PrimaryStartButton";
import { VoiceVisual } from "./VoiceVisual";

export function FinalCta({ onStart }: { onStart: () => void }) {
  const { hi, en } = useLanguage();
  const [state, setState] = useState<"rest" | "attentive" | "listening">("rest");

  const start = () => {
    setState("listening");
    window.setTimeout(onStart, 520);
  };

  return (
    <section
      className="relative overflow-hidden px-6 py-20 sm:px-10 lg:px-16 lg:py-28"
      aria-labelledby="final-cta-title"
    >
      <span
        aria-hidden="true"
        className="organic-blob -left-24 top-0 size-[28rem] bg-primary-soft/45"
      />
      <span
        aria-hidden="true"
        className="organic-blob -right-24 bottom-0 size-[24rem] bg-accent/50"
      />

      <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[var(--radius-4xl)] border border-primary/15 bg-surface px-7 py-16 text-center shadow-[var(--shadow-lift)] sm:px-14 lg:py-20">
        <VoiceVisual
          state={state === "rest" ? "attentive" : state}
          className="pointer-events-none absolute -right-16 -top-16 size-64 opacity-25 sm:size-80"
        />

        <h2
          id="final-cta-title"
          className="relative mx-auto max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-[3rem]"
        >
          {hi && (
            <span lang="hi" className="deva block">
              अपनी बात बताने के लिए तैयार हैं?
            </span>
          )}
          {en && (
            <span
              lang="en"
              className={
                hi ? "mt-4 block text-xl font-medium text-muted-foreground sm:text-2xl" : "block"
              }
            >
              Ready to tell us what&rsquo;s bothering you?
            </span>
          )}
        </h2>

        <Bi
          as="p"
          className="relative mx-auto mt-7 max-w-xl text-lg leading-relaxed"
          hiClassName="text-foreground"
          enClassName="mt-2 text-base"
          hi="कुछ आसान सवालों से शुरुआत करें।"
          en="It starts with a few simple questions."
        />

        <div className="relative mx-auto mt-10 max-w-xl">
          <PrimaryStartButton
            onStart={start}
            onAttention={() => setState("attentive")}
            onAttentionEnd={() => setState((s) => (s === "listening" ? s : "rest"))}
            pressed={state === "listening"}
          />
        </div>
      </div>
    </section>
  );
}
