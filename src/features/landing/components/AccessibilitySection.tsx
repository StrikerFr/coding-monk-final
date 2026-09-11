import { useEffect, useState, type ReactNode } from "react";
import accessibilityKiosk from "@/assets/accessibility-kiosk.jpg";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";
import { Bi, Eyebrow, Reveal } from "./section-kit";

function Icon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground transition-transform duration-500 group-hover:scale-105"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </span>
  );
}

const items = [
  {
    hi: "बड़े, साफ़ अक्षर",
    en: "Easy to see",
    noteHi: "बड़ा टेक्स्ट और साफ़ contrast",
    noteEn: "Large type and clear contrast",
    icon: (
      <>
        <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z" />
        <circle cx="12" cy="12" r="2.6" />
      </>
    ),
  },
  {
    hi: "बोलकर बताना आसान",
    en: "Easy to speak",
    noteHi: "अपनी भाषा में बोलिए",
    noteEn: "Speak in your own language",
    icon: (
      <>
        <path d="M12 3.5a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0v-4a3 3 0 0 1 3-3z" />
        <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
      </>
    ),
  },
  {
    hi: "बड़े बटन, आसान टैप",
    en: "Easy to touch",
    noteHi: "हर control आराम से दबाएँ",
    noteEn: "Comfortable, generous controls",
    icon: (
      <>
        <path d="M9 11V6.5a2 2 0 1 1 4 0V12" />
        <path d="M13 9.5a2 2 0 0 1 4 0V15a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5v-2l2-1" />
      </>
    ),
  },
  {
    hi: "हिन्दी और English",
    en: "Hindi and English",
    noteHi: "भाषा कभी भी बदलें",
    noteEn: "Switch language at any moment",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" />
      </>
    ),
  },
  {
    hi: "सहायक तकनीक के साथ",
    en: "Assistive technology ready",
    noteHi: "Keyboard और screen reader सहायता",
    noteEn: "Keyboard and screen reader support",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18a9 9 0 0 0 0-18z" />
      </>
    ),
  },
  {
    hi: "कम से कम चरण",
    en: "As few steps as possible",
    noteHi: "एक बार में एक आसान सवाल",
    noteEn: "One clear question at a time",
    icon: <path d="M4 18h4V9H4zM10 18h4V5h-4zM16 18h4v-6h-4z" />,
  },
] as const;

export function AccessibilitySection() {
  const { hi, en } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeItem = items[activeIndex] ?? items[0];

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [paused]);

  const selectStep = (index: number) => {
    setActiveIndex(index);
    setPaused(true);
  };

  const moveStep = (direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + items.length) % items.length);
    setPaused(true);
  };

  return (
    <section
      id="accessibility"
      aria-labelledby="a11y-title"
      className="relative isolate overflow-hidden bg-foreground text-background"
    >
      <img
        src={accessibilityKiosk}
        alt="An elderly woman comfortably uses an accessible health kiosk with a staff member nearby."
        width={1600}
        height={1000}
        loading="lazy"
        className="absolute inset-0 -z-20 size-full object-cover object-[64%_center]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-foreground via-foreground/80 to-foreground/15"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-foreground via-transparent to-foreground/15"
      />

      <div className="mx-auto flex min-h-[780px] max-w-[1500px] flex-col px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
        <Reveal className="max-w-2xl">
          <Eyebrow hi="सबके लिए" en="Designed for everyone" />
          <h2
            id="a11y-title"
            className="mt-6 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl"
          >
            {hi && (
              <span lang="hi" className="deva block">
                हर किसी के लिए आसान।
              </span>
            )}
            {en && (
              <span
                lang="en"
                className={
                  hi ? "mt-3 block text-2xl font-medium text-background/75 sm:text-3xl" : "block"
                }
              >
                Easy for everyone to use.
              </span>
            )}
          </h2>
          <Bi
            as="p"
            className="mt-7 max-w-xl text-lg leading-relaxed"
            hiClassName="text-background"
            enClassName="mt-2 text-base text-background/75"
            hi="बड़े controls, साफ़ भाषा और अपनी गति से आगे बढ़ने की आज़ादी।"
            en="Large controls, plain language and the freedom to move at your own pace."
          />
        </Reveal>

        <Reveal className="mt-14 lg:mt-auto">
          <div
            className="overflow-hidden rounded-2xl border border-background/25 bg-foreground/55 shadow-lift backdrop-blur-xl"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
            }}
          >
            <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.6fr)]">
              <ol
                className="grid grid-cols-2 border-b border-background/20 sm:grid-cols-3 lg:border-b-0 lg:border-r"
                aria-label="Accessibility features"
              >
                {items.map((item, index) => {
                  const active = index === activeIndex;
                  return (
                    <li key={item.en} className="min-w-0">
                      <Button
                        type="button"
                        variant="ghost"
                        aria-pressed={active}
                        aria-controls="accessibility-step-detail"
                        onClick={() => selectStep(index)}
                        className={`group relative h-full min-h-24 w-full justify-start rounded-none border-background/15 px-4 py-4 text-left text-background hover:bg-background/10 hover:text-background sm:min-h-28 sm:px-5 ${
                          index % 2 === 0 ? "border-r" : ""
                        } ${index < 4 ? "border-b" : ""} sm:[&:not(:nth-child(3n))]:border-r sm:[&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r lg:[&:nth-child(n+4)]:border-b-0 ${
                          active ? "bg-background/12" : ""
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute inset-x-0 bottom-0 h-1 origin-left bg-primary transition-transform duration-500 ${active ? "scale-x-100" : "scale-x-0"}`}
                        />
                        <span
                          className={`grid size-9 shrink-0 place-items-center rounded-full border text-xs font-bold tabular-nums transition-all duration-300 ${
                            active
                              ? "border-accent bg-accent text-accent-foreground"
                              : "border-background/30 text-background/65 group-hover:border-background/60"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 whitespace-normal">
                          {hi && (
                            <span className="deva block text-sm font-semibold">{item.hi}</span>
                          )}
                          {en && (
                            <span
                              className={`block text-xs ${hi ? "mt-0.5 text-background/65" : "font-semibold"}`}
                            >
                              {item.en}
                            </span>
                          )}
                        </span>
                      </Button>
                    </li>
                  );
                })}
              </ol>

              <div
                id="accessibility-step-detail"
                className="flex min-h-64 flex-col justify-between p-6 sm:p-7"
                aria-live="polite"
              >
                <div key={activeItem.en} className="animate-rise">
                  <div className="flex items-center justify-between gap-4">
                    <Icon>{activeItem.icon}</Icon>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-background/55">
                      {String(activeIndex + 1).padStart(2, "0")} / 06
                    </span>
                  </div>
                  <Bi
                    className="mt-6 text-xl font-semibold leading-snug text-background"
                    enClassName="mt-1 text-base font-medium text-background/70"
                    hi={activeItem.hi}
                    en={activeItem.en}
                  />
                  <Bi
                    as="p"
                    className="mt-3 text-sm leading-relaxed text-background/80"
                    enClassName="mt-1 text-background/60"
                    hi={activeItem.noteHi}
                    en={activeItem.noteEn}
                  />
                </div>

                <div className="mt-7 flex items-center justify-between border-t border-background/20 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Previous accessibility feature"
                    onClick={() => moveStep(-1)}
                    className="size-11 rounded-full border border-background/25 text-background hover:bg-background/10 hover:text-background"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </Button>
                  <div className="flex gap-1.5" aria-hidden="true">
                    {items.map((item, index) => (
                      <span
                        key={item.en}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          index === activeIndex ? "w-8 bg-accent" : "w-1.5 bg-background/30"
                        }`}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Next accessibility feature"
                    onClick={() => moveStep(1)}
                    className="size-11 rounded-full border border-background/25 text-background hover:bg-background/10 hover:text-background"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
