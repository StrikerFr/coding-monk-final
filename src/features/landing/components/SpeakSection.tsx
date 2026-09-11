import { useLanguage } from "@/lib/language";
import { media } from "@/features/landing/content";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";
import { HumanVideo } from "./HumanVideo";
import { SoundWave } from "./SoundWave";
import { Bi, Eyebrow } from "./section-kit";

const supports = [
  {
    hi: "अपनी भाषा में बोलिए",
    en: "Speak in your own language",
    note: { hi: "हिंदी और क्षेत्रीय भाषाओं में", en: "Hindi and regional languages" },
  },
  {
    hi: "कोई टाइपिंग नहीं, कोई फ़ॉर्म नहीं",
    en: "No typing, no forms",
    note: { hi: "पढ़ना-लिखना ज़रूरी नहीं", en: "Reading and writing are not required" },
  },
  {
    hi: "जितनी बार चाहें दोहराइए",
    en: "Repeat as many times as you like",
    note: { hi: "कोई जल्दी नहीं है", en: "There is no hurry" },
  },
];

export function SpeakSection() {
  const { hi, en } = useLanguage();
  const { ref, shown } = useReveal<HTMLDivElement>(0.2);

  return (
    <section
      className="relative overflow-hidden bg-surface-sunken px-6 py-16 sm:px-10 lg:px-16 lg:py-24"
      aria-labelledby="speak-title"
    >
      {/* Soft curved transition into this band */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/2 h-32 w-[140%] -translate-x-1/2 rounded-[50%] bg-background"
      />
      <span
        aria-hidden="true"
        className="organic-blob -right-24 top-24 size-[26rem] bg-accent/45"
      />

      <div
        ref={ref}
        className={cn(
          "reveal relative mx-auto grid max-w-[1400px] items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20",
          shown && "reveal-in",
        )}
      >
        <div className="group relative">
          <HumanVideo
            poster={media.noTyping.poster}
            posterAlt={hi && !en ? media.noTyping.altHi : media.noTyping.alt}
            src={media.noTyping.video}
            width={media.noTyping.width}
            height={media.noTyping.height}
            zoomOnHover
            className="aspect-[7/5] w-full"
          />
          <div className="animate-float absolute -bottom-6 left-6 flex items-center gap-3 rounded-full border border-border/70 bg-surface/95 px-5 py-3 shadow-[var(--shadow-soft)] backdrop-blur-sm sm:left-10">
            <SoundWave active={shown} className="h-6" />
            <span className="text-base font-semibold sm:text-lg">
              {hi && <span className="deva">हम सुन रहे हैं</span>}
              {hi && en && (
                <span aria-hidden="true" className="px-2 opacity-50">
                  /
                </span>
              )}
              {en && <span>We&rsquo;re listening</span>}
            </span>
          </div>
        </div>

        <div className="mt-8 text-center lg:mt-0 lg:text-left">
          <Eyebrow hi="आवाज़ पहले" en="Voice first" />

          <h2
            id="speak-title"
            className="mt-5 text-3xl font-semibold leading-[1.15] sm:text-4xl lg:text-[2.9rem]"
          >
            {hi && (
              <span lang="hi" className="deva block">
                लिखने की ज़रूरत नहीं है।
              </span>
            )}
            {en && (
              <span
                lang="en"
                className={
                  hi ? "mt-3 block text-xl font-medium text-muted-foreground sm:text-2xl" : "block"
                }
              >
                You don&rsquo;t need to type.
              </span>
            )}
          </h2>

          <Bi
            as="p"
            className="mt-5 text-lg leading-relaxed sm:text-xl"
            hi="बस बोलकर बताइए कि आपको क्या तकलीफ़ है — बाक़ी काम मशीन कर लेगी।"
            en="Just say what is troubling you. The kiosk takes care of the rest."
            hiClassName="font-medium"
            enClassName="mt-2"
          />

          {/* Spoken words becoming a written note */}
          <div className="mt-8 rounded-3xl border border-border/70 bg-surface/90 p-5 text-left shadow-[var(--shadow-soft)] sm:p-6">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/12"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-5 text-primary"
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
              <SoundWave active={shown} className="h-7" />
              <span className="ml-auto text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {hi && !en ? (
                  <span lang="hi" className="deva tracking-normal">
                    सुन रहे हैं
                  </span>
                ) : (
                  "Listening"
                )}
              </span>
            </div>

            <p className="mt-4 rounded-2xl bg-surface-sunken px-4 py-3 text-base leading-relaxed sm:text-lg">
              {hi && (
                <span lang="hi" className="deva block">
                  &ldquo;तीन दिन से बुखार है और सिर भारी लग रहा है।&rdquo;
                </span>
              )}
              {en && (
                <span
                  lang="en"
                  className={
                    hi ? "mt-1.5 block text-sm text-muted-foreground sm:text-base" : "block"
                  }
                >
                  &ldquo;I&rsquo;ve had a fever for three days and my head feels heavy.&rdquo;
                </span>
              )}
            </p>

            <div className="mt-4 flex items-start gap-3">
              <span aria-hidden="true" className="mt-2 h-px w-6 shrink-0 bg-border sm:w-8" />
              <Bi
                as="p"
                className="text-sm leading-relaxed sm:text-base"
                hi="आपकी बात एक साफ़-सुथरी लिखित जानकारी बन जाती है, जिसे डॉक्टर पढ़ते हैं।"
                en="Your words become a clear written summary that the doctor reads."
              />
            </div>
          </div>

          <ul className="mt-8 grid gap-4 text-left">
            {supports.map((item) => (
              <li key={item.en} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-primary/12 text-primary"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 12.5 9.5 18 20 6.5" />
                  </svg>
                </span>
                <span>
                  <Bi
                    className="text-base font-medium sm:text-lg"
                    hi={item.hi}
                    en={item.en}
                    enClassName="mt-1 text-sm sm:text-base"
                  />
                  <Bi
                    className="mt-1 text-sm text-muted-foreground"
                    hi={item.note.hi}
                    en={item.note.en}
                    enClassName="mt-0.5"
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
