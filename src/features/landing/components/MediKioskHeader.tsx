import { useEffect, useRef, useState } from "react";
import {
  Accessibility,
  Check,
  CircleHelp,
  Eye,
  HeartHandshake,
  Menu,
  Minus,
  PersonStanding,
  Plus,
  Search,
} from "lucide-react";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";
import { AccessibilityMenu as AccessibilityMenu2, ReadAloudToggle } from "@/components/a11y";
import { AuthStatus } from "@/features/auth/AuthStatus";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { LanguageSelector } from "./LanguageSelector";

const navItems = [
  { label: "Home", hi: "होम", href: "#main-content", target: "main-content" },
  { label: "How It Works", hi: "यह कैसे काम करता है", href: "#steps-title", target: "steps-title" },
  { label: "Voice First", hi: "बोलकर बताइए", href: "#speak-title", target: "speak-title" },
  {
    label: "Built for India",
    hi: "भारत के लिए बनाया गया",
    href: "#india-title",
    target: "india-title",
  },
  { label: "AYUSH", hi: "आयुष", href: "#ayush-title", target: "ayush-title" },
  { label: "Your Privacy", hi: "आपकी निजता", href: "#trust-title", target: "trust-title" },
  { label: "For Staff", hi: "स्टाफ़ के लिए", href: "#staff-title", target: "staff-title" },
] as const;

const searchIndex = [
  {
    href: "#main-content",
    label: "Home",
    hiLabel: "होम",
    keywords: ["home", "medikiosk", "start", "होम", "मेडिकिओस्क"],
  },
  {
    href: "#steps-title",
    label: "How It Works",
    hiLabel: "यह कैसे काम करता है",
    keywords: ["how it works", "steps", "process", "काम", "प्रक्रिया"],
  },
  {
    href: "#speak-title",
    label: "Speak Your Problem",
    hiLabel: "अपनी समस्या बताएँ",
    keywords: ["speak", "voice", "hindi", "english", "बोलें", "आवाज़"],
  },
  {
    href: "#india-title",
    label: "Built for India",
    hiLabel: "भारत के लिए बना",
    keywords: ["india", "bharat", "भारत", "indian patients"],
  },
  {
    href: "#ayush-title",
    label: "AYUSH Case-Taking",
    hiLabel: "आयुष केस टेकिंग",
    keywords: ["ayush", "ayurveda", "yoga", "homeopathy", "आयुष"],
  },
  {
    href: "#structure-title",
    label: "Words to Structure",
    hiLabel: "शब्दों से संरचना",
    keywords: ["structure", "words", "information", "संरचना", "जानकारी"],
  },
  {
    href: "#documents-title",
    label: "Documents & History",
    hiLabel: "दस्तावेज़ और इतिहास",
    keywords: ["documents", "history", "records", "lab", "prescription", "दस्तावेज़"],
  },
  {
    href: "#staff-title",
    label: "For Staff",
    hiLabel: "स्टाफ़ के लिए",
    keywords: ["staff", "clinician", "doctor", "handoff", "स्टाफ़", "चिकित्सक"],
  },
  {
    href: "#trust-title",
    label: "Your Privacy",
    hiLabel: "आपकी गोपनीयता",
    keywords: ["privacy", "trust", "security", "consent", "गोपनीयता", "सुरक्षा"],
  },
  {
    href: "#ecosystem-title",
    label: "Digital Health Ecosystem",
    hiLabel: "डिजिटल स्वास्थ्य पारिस्थितिकी",
    keywords: ["ecosystem", "abdm", "abha", "digital health", "डिजिटल स्वास्थ्य"],
  },
  {
    href: "#a11y-title",
    label: "Accessibility",
    hiLabel: "पहुँच",
    keywords: ["accessibility", "readable", "contrast", "पहुँच", "दृश्यता"],
  },
  {
    href: "#audience-title",
    label: "Who It Is For",
    hiLabel: "किसके लिए है",
    keywords: ["audience", "patients", "clinicians", "hospitals", "मरीज़", "चिकित्सक"],
  },
  {
    href: "#workflow-title",
    label: "Full Workflow",
    hiLabel: "पूर्ण कार्यप्रवाह",
    keywords: ["workflow", "system", "journey", "कार्यप्रवाह"],
  },
  {
    href: "#care-title",
    label: "Built with Care",
    hiLabel: "ध्यान से बनाया गया",
    keywords: ["care", "human", "technology", "ध्यान", "मानवीय"],
  },
  {
    href: "#final-cta-title",
    label: "Get Started",
    hiLabel: "शुरू करें",
    keywords: ["start", "get started", "begin", "शुरू करें"],
  },
] as const;

function SearchBar({ compact = false }: { compact?: boolean }) {
  const { hi, en } = useLanguage();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const results =
    query.trim().length > 0
      ? searchIndex.filter(
          (item) =>
            item.keywords.some((k) => k.toLowerCase().includes(query.toLowerCase())) ||
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.hiLabel.toLowerCase().includes(query.toLowerCase()),
        )
      : [];

  const placeholder = hi && en ? "Search topics..." : en ? "Search topics..." : "विषय खोजें...";
  const label = hi && en ? "Search this page" : en ? "Search this page" : "इस पेज पर खोजें";

  const handleSelect = (href: string) => {
    setQuery("");
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", compact ? "w-full" : "hidden w-full max-w-xl lg:block")}
    >
      <div className="group relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <input
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls="header-search-results"
          aria-label={label}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="h-12 w-full rounded-full border border-border/80 bg-surface pl-12 pr-4 text-base text-foreground shadow-[0_2px_12px_-6px_var(--color-foreground)] transition-all duration-300 ease-[var(--ease-calm)] placeholder:text-muted-foreground/80 outline-none ring-primary/25 hover:border-primary/40 focus:border-primary/60 focus:ring-4"
        />
      </div>
      {open && (
        <div
          id="header-search-results"
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2.5 max-h-80 w-full min-w-[18rem] max-w-xl overflow-auto rounded-2xl border border-border bg-surface p-2 shadow-[var(--shadow-lift)]"
        >
          {query.trim().length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              {hi && <span className="deva block">खोजने के लिए लिखें...</span>}
              {en && (
                <span className={hi ? "block text-xs" : "block"}>Type to find a section...</span>
              )}
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              {hi && <span className="deva block">कोई परिणाम नहीं मिला</span>}
              {en && <span className={hi ? "block text-xs" : "block"}>No results found</span>}
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.href}
                role="option"
                type="button"
                onClick={() => handleSelect(item.href)}
                className="w-full rounded-xl px-3.5 py-2.5 text-left text-[0.95rem] font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {hi && (
                  <span lang="hi" className="deva block">
                    {item.hiLabel}
                  </span>
                )}
                {en && (
                  <span lang="en" className={hi ? "block text-xs text-muted-foreground" : "block"}>
                    {item.label}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Brand() {
  return (
    <a
      href="#main-content"
      aria-label="MediKiosk home"
      className="group flex min-w-0 items-center gap-3 rounded-md outline-none"
    >
      <span
        aria-hidden="true"
        className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-transform duration-300 ease-[var(--ease-calm)] group-hover:scale-[1.04] sm:size-11"
      >
        <img src="/logo.png" alt="" className="size-8 object-contain sm:size-9" />
      </span>
      <span className="min-w-0">
        <span className="block text-xl font-semibold leading-none sm:text-2xl">MediKiosk</span>
        <span className="mt-1 hidden truncate text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:block">
          Digital Patient Case-Taking
        </span>
      </span>
    </a>
  );
}

function HelpDialog({ compact = false }: { compact?: boolean }) {
  const { hi, en } = useLanguage();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "min-h-11 gap-2 rounded-md px-3 text-sm font-semibold text-foreground hover:bg-muted",
            compact && "w-full justify-start px-0 text-base",
          )}
        >
          <CircleHelp aria-hidden="true" />
          Need Help?
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl border-border bg-surface p-7 shadow-[var(--shadow-lift)] sm:p-8">
        <DialogHeader className="pr-7 text-left">
          <span
            aria-hidden="true"
            className="mb-3 grid size-12 place-items-center rounded-full bg-accent text-secondary"
          >
            <HeartHandshake className="size-6" />
          </span>
          <DialogTitle className="text-2xl font-semibold">
            {hi && <span className="deva block">मदद चाहिए?</span>}
            {en && (
              <span className={hi ? "mt-1 block text-lg text-muted-foreground" : "block"}>
                Need help?
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="pt-3 text-base leading-relaxed text-foreground">
            {hi && <span className="deva block">कृपया पास खड़े स्टाफ से पूछें।</span>}
            {en && (
              <span className={hi ? "mt-1 block text-muted-foreground" : "block"}>
                Please ask a staff member nearby.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogClose asChild>
          <Button className="mt-3 min-h-14 w-full rounded-lg text-base font-semibold">
            <PersonStanding aria-hidden="true" />
            Ask a Staff Member
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

/** The public header uses the shared MediKiosk accessibility panel. */
function AccessibilityMenu({ compact = false }: { compact?: boolean }) {
  return (
    <AccessibilityMenu2
      triggerVariant="labelled"
      {...(compact ? { triggerClassName: "w-full justify-start px-0 text-base" } : {})}
    />
  );
}

export function MediKioskHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("main-content");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      let current = "main-content";
      for (const item of navItems) {
        const element = document.getElementById(item.target);
        if (element && element.getBoundingClientRect().top <= 190) current = item.target;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-border/70 bg-background transition-[background-color,box-shadow] duration-300 ease-[var(--ease-calm)]",
          scrolled &&
            "bg-background/92 shadow-[0_8px_24px_-22px_var(--color-foreground)] backdrop-blur-xl",
        )}
      >
        <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-4 sm:px-8 lg:flex lg:justify-between lg:px-10">
          <div
            className={cn(
              "flex min-h-18 items-center transition-[min-height] duration-300",
              scrolled && "lg:min-h-15",
            )}
          >
            <Brand />
          </div>

          <div className="hidden lg:flex lg:flex-1 lg:justify-center lg:px-10">
            <SearchBar />
          </div>

          <div className="lg:hidden">
            <LanguageSelector compact />
          </div>

          <div className="hidden items-center gap-1 lg:flex">
            <ReadAloudToggle compact />
            <AccessibilityMenu />
            <span aria-hidden="true" className="mx-2 h-6 w-px bg-border" />
            <LanguageSelector />
            <span aria-hidden="true" className="mx-2 h-6 w-px bg-border" />
            <AuthStatus />
            <span aria-hidden="true" className="mx-2 h-6 w-px bg-border" />
            <HelpDialog />
          </div>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11"
                  aria-label="Open navigation menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[min(22rem,88vw)] border-border bg-background p-6"
              >
                <SheetHeader className="pr-8 text-left">
                  <SheetTitle className="text-xl">MediKiosk</SheetTitle>
                  <SheetDescription>Digital Patient Case-Taking</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <SearchBar compact />
                </div>
                <nav aria-label="Mobile navigation" className="mt-6 border-y border-border">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.target}>
                      <a
                        href={item.href}
                        onClick={() => setActive(item.target)}
                        data-speak
                        data-speak-text={item.label}
                        data-speak-text-hi={item.hi}
                        className="grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center border-b border-border text-base font-semibold last:border-0"
                      >
                        {item.label}
                        {active === item.target && (
                          <Check aria-hidden="true" className="size-4 text-primary" />
                        )}
                      </a>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-6 space-y-2">
                  <ReadAloudToggle className="w-full justify-center" />
                  <AccessibilityMenu compact />
                  <AuthStatus className="justify-center" />
                  <HelpDialog compact />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="hidden border-t border-border/70 lg:block">
          <nav
            aria-label="Primary navigation"
            className="mx-auto flex h-13 max-w-[1400px] items-stretch gap-9 px-10"
          >
            {navItems.map((item) => (
              <a
                key={item.target}
                href={item.href}
                onClick={() => setActive(item.target)}
                aria-current={active === item.target ? "page" : undefined}
                className={cn(
                  "group relative flex min-w-0 items-center text-[0.95rem] font-semibold text-muted-foreground transition-colors duration-300 hover:text-foreground",
                  active === item.target && "text-foreground",
                )}
              >
                <span data-speak data-speak-text={item.label} data-speak-text-hi={item.hi}>
                  {item.label}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 ease-[var(--ease-calm)] group-hover:scale-x-100",
                    active === item.target && "scale-x-100",
                  )}
                />
              </a>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
