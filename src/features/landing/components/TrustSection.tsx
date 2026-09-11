import { useLanguage } from "@/lib/language";
import { media } from "@/features/landing/content";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";
import { Bi } from "./section-kit";

const points = [
  { hi: "आपकी सहमति से ही जानकारी दर्ज होती है।", en: "Nothing is recorded without your consent." },
  { hi: "जानकारी सुरक्षित तरीके से रखी जाती है।", en: "Information is handled securely." },
  { hi: "पहुँच सीमित और नियंत्रित रहती है।", en: "Access stays limited and controlled." },
  {
    hi: "यह जानकारी आपकी देखभाल के लिए इस्तेमाल होती है।",
    en: "It is used for your care, for nothing else.",
  },
  { hi: "चिकित्सकीय कार्रवाई का रिकॉर्ड रहता है।", en: "Clinical actions remain auditable." },
];

const markers = [
  { hi: "सहमति", en: "Consent" },
  { hi: "सुरक्षित", en: "Secure" },
  { hi: "नियंत्रित पहुँच", en: "Controlled access" },
  { hi: "रिकॉर्ड योग्य", en: "Auditable" },
];

export function TrustSection() {
  const { hi, en } = useLanguage();
  const { ref, shown } = useReveal<HTMLDivElement>(0.15);

  return (
    <section className="px-6 py-16 sm:px-10 lg:px-16 lg:py-24" aria-labelledby="trust-title">
      <div
        ref={ref}
        className={cn(
          "reveal media-frame mx-auto max-w-[1300px] ring-1 ring-secondary/15",
          shown && "reveal-in",
        )}
      >
        <img
          src={media.trust.poster}
          alt=""
          aria-hidden="true"
          width={media.trust.width}
          height={media.trust.height}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-accent/60" />
        <div aria-hidden="true" className="absolute inset-0 bg-surface/80" />
        <span
          aria-hidden="true"
          className="organic-blob -left-16 -top-10 size-[22rem] bg-accent/70"
        />
        <span
          aria-hidden="true"
          className="organic-blob -bottom-16 -right-10 size-[20rem] bg-secondary/15"
        />

        <div className="relative grid gap-12 px-7 py-14 sm:px-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16 lg:py-20">
          <div>
            <span
              aria-hidden="true"
              className="grid size-16 place-items-center rounded-full bg-accent ring-1 ring-secondary/20 shadow-[var(--shadow-soft)]"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-7 text-secondary"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="10" width="16" height="10" rx="3" />
                <path d="M8 10V8a4 4 0 0 1 8 0v2M12 14v2.5" />
              </svg>
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
              {hi && (
                <span lang="hi" className="deva text-sm tracking-normal">
                  गोपनीयता और सहमति
                </span>
              )}
              {hi && en && (
                <span aria-hidden="true" className="px-2 opacity-40">
                  ·
                </span>
              )}
              {en && <span lang="en">Privacy &amp; consent</span>}
            </p>
            <h2
              id="trust-title"
              className="mt-4 text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]"
            >
              {hi && (
                <span lang="hi" className="deva block">
                  आपकी जानकारी, आपकी देखभाल के लिए।
                </span>
              )}
              {en && (
                <span
                  lang="en"
                  className={
                    hi
                      ? "mt-3 block text-xl font-medium text-muted-foreground sm:text-2xl"
                      : "block"
                  }
                >
                  Your information, used for your care.
                </span>
              )}
            </h2>

            <ul className="mt-8 flex flex-wrap gap-2.5">
              {markers.map((m) => (
                <li
                  key={m.en}
                  className="flex items-center gap-2 rounded-full border border-secondary/30 bg-surface/80 px-4 py-2 text-sm font-semibold"
                >
                  <span aria-hidden="true" className="size-2 rounded-full bg-secondary" />
                  {hi && (
                    <span lang="hi" className="deva">
                      {m.hi}
                    </span>
                  )}
                  {hi && en && (
                    <span aria-hidden="true" className="opacity-40">
                      ·
                    </span>
                  )}
                  {en && (
                    <span lang="en" className={hi ? "text-muted-foreground" : ""}>
                      {m.en}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <ul className="space-y-4">
            {points.map((p, i) => (
              <li
                key={p.en}
                className={cn(
                  "flex items-start gap-4 rounded-3xl border border-border/60 bg-surface/85 px-5 py-4 transition-all duration-700 ease-[var(--ease-calm)]",
                  shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                )}
                style={{ transitionDelay: `${i * 110}ms` }}
              >
                <span
                  aria-hidden="true"
                  className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-accent text-secondary"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 13 4 4 10-10" />
                  </svg>
                </span>
                <Bi
                  className="text-base leading-relaxed"
                  hiClassName="font-semibold"
                  enClassName="mt-1 text-sm"
                  hi={p.hi}
                  en={p.en}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
