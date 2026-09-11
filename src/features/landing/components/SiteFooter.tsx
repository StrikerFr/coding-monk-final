import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/lib/language";
import { Bi } from "./section-kit";

type Item = { hi: string; en: string; href?: string; action?: "help" | "language" | "start" };

const columns: { hi: string; en: string; items: Item[] }[] = [
  {
    hi: "जानें",
    en: "Explore",
    items: [
      { hi: "मुख्य पृष्ठ", en: "Home", href: "#main-content" },
      { hi: "यह कैसे काम करता है", en: "How It Works", href: "#steps-title" },
      { hi: "मरीज़ों के लिए", en: "For Patients", href: "#speak-title" },
      { hi: "स्टाफ़ के लिए", en: "For Staff", href: "#staff-title" },
      { hi: "आपकी गोपनीयता", en: "Your Privacy", href: "#trust-title" },
    ],
  },
  {
    hi: "मरीज़",
    en: "Patient",
    items: [
      { hi: "केस बताना शुरू करें", en: "Start case-taking", action: "start" },
      { hi: "मेडिकिओस्क कैसे इस्तेमाल करें", en: "How to use MediKiosk", href: "#steps-title" },
      { hi: "भाषा", en: "Language", action: "language" },
      { hi: "सुगम्यता", en: "Accessibility", href: "#a11y-title" },
      { hi: "मदद चाहिए", en: "Need help", action: "help" },
    ],
  },
  {
    hi: "भरोसा और गोपनीयता",
    en: "Trust & Privacy",
    items: [
      { hi: "गोपनीयता", en: "Privacy", href: "#trust-title" },
      { hi: "सहमति", en: "Consent", href: "#trust-title" },
      { hi: "जानकारी का उपयोग", en: "Data handling", href: "#trust-title" },
      { hi: "सुरक्षा", en: "Safety", href: "#safety-title" },
      { hi: "सुगम्यता वक्तव्य", en: "Accessibility statement", href: "#a11y-title" },
    ],
  },
  {
    hi: "स्वास्थ्य तंत्र",
    en: "Healthcare ecosystem",
    items: [
      { hi: "आयुष", en: "AYUSH", href: "#ayush-title" },
      { hi: "डिजिटल स्वास्थ्य", en: "Digital health", href: "#ecosystem-title" },
      { hi: "ABHA / ABDM", en: "ABHA / ABDM", href: "#ecosystem-title" },
      { hi: "इंटरऑपरेबिलिटी", en: "Interoperability", href: "#ecosystem-title" },
    ],
  },
];

export function SiteFooter({ onHelp }: { onHelp: () => void }) {
  const { hi, en, setLang, lang } = useLanguage();

  const label = (item: Item) => (
    <>
      {hi && (
        <span lang="hi" className="deva block">
          {item.hi}
        </span>
      )}
      {en && (
        <span lang="en" className={hi ? "block text-xs text-muted-foreground" : "block"}>
          {item.en}
        </span>
      )}
    </>
  );

  return (
    <footer className="border-t border-border/70 bg-surface-sunken px-6 pb-10 pt-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))] lg:gap-10">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary/12"
              >
                <img src="/logo.png" alt="" className="size-9 object-contain" />
              </span>
              <span className="text-xl font-semibold tracking-tight">MediKiosk</span>
            </div>
            <Bi
              className="mt-5 text-base font-semibold"
              enClassName="mt-1 text-sm font-medium"
              hi="आपकी सेहत, हमारी देखभाल।"
              en="Your health, our care."
            />
            <Bi
              as="p"
              className="mt-4 max-w-sm text-sm leading-relaxed"
              hiClassName="text-foreground"
              enClassName="mt-1.5"
              hi="मरीज़ की बात से शुरू होने वाला, बोलकर चलने वाला डिजिटल केस-टेकिंग अनुभव।"
              en="A voice-first digital patient case-taking experience designed for modern healthcare workflows."
            />
          </div>

          {columns.map((col) => (
            <nav key={col.en} aria-label={col.en}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {hi && (
                  <span lang="hi" className="deva block text-sm tracking-normal">
                    {col.hi}
                  </span>
                )}
                {en && (
                  <span lang="en" className="block">
                    {col.en}
                  </span>
                )}
              </h2>
              <ul className="mt-5 space-y-3.5 text-base">
                {col.items.map((item) => (
                  <li key={item.en}>
                    {item.action === "start" ? (
                      <Link
                        to="/patient/intake"
                        className="inline-block rounded-md py-0.5 font-medium hover:text-primary"
                      >
                        {label(item)}
                      </Link>
                    ) : item.action ? (
                      <button
                        type="button"
                        onClick={() =>
                          item.action === "help" ? onHelp() : setLang(lang === "hi" ? "en" : "hi")
                        }
                        className="inline-block rounded-md py-0.5 text-left font-medium hover:text-primary"
                      >
                        {label(item)}
                      </button>
                    ) : (
                      <a
                        href={item.href}
                        className="inline-block rounded-md py-0.5 font-medium hover:text-primary"
                      >
                        {label(item)}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Trust statement */}
        <p className="mt-14 border-t border-border/70 pt-8">
          <Bi
            className="text-sm leading-relaxed"
            hiClassName="text-muted-foreground"
            enClassName="mt-1"
            hi="मेडिकिओस्क चिकित्सकों की सहायता के लिए बनाया गया है — उनकी जगह लेने के लिए नहीं।"
            en="MediKiosk is designed to support healthcare professionals — not replace them."
          />
        </p>

        <div className="mt-8 flex flex-col gap-4 border-t border-border/70 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 MediKiosk</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li>
              <a href="#trust-title" className="hover:text-primary">
                {hi && !en ? (
                  <span lang="hi" className="deva">
                    गोपनीयता
                  </span>
                ) : (
                  "Privacy"
                )}
              </a>
            </li>
            <li>
              <a href="#review-title" className="hover:text-primary">
                {hi && !en ? (
                  <span lang="hi" className="deva">
                    शर्तें
                  </span>
                ) : (
                  "Terms"
                )}
              </a>
            </li>
            <li>
              <a href="#a11y-title" className="hover:text-primary">
                {hi && !en ? (
                  <span lang="hi" className="deva">
                    सुगम्यता
                  </span>
                ) : (
                  "Accessibility"
                )}
              </a>
            </li>
            <li>
              <button type="button" onClick={onHelp} className="hover:text-primary">
                {hi && !en ? (
                  <span lang="hi" className="deva">
                    मदद
                  </span>
                ) : (
                  "Contact a staff member"
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
