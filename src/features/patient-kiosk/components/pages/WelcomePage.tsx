import { Link, useNavigate } from "@tanstack/react-router";
import { MessageCircle, Mic } from "lucide-react";
import heroPoster from "@/assets/hero-kiosk-poster.jpg";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { KioskPrimaryButton } from "../KioskPrimaryButton";
import { KioskProgress } from "../KioskProgress";
import { KioskText } from "../KioskText";
import { KioskTrustNote } from "../KioskTrustNote";
import { cn } from "@/lib/utils";
import { ListenButton } from "@/components/a11y";

/** P0 — the calm beginning of the patient journey. */
export function WelcomePage() {
  const { t, tIn, language, bilingual, goToStep, startNewSession } = useKiosk();
  const navigate = useNavigate();

  const start = async () => {
    await startNewSession(language);
    goToStep("consent");
    void navigate({ to: "/patient-kiosk/consent" });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-6 py-10 sm:px-10 lg:py-14">
      <div className="grid flex-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Message column */}
        <div className="animate-rise flex flex-col items-start">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            {tIn("en", "kiosk.welcome.eyebrow").toUpperCase()}
          </p>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl xl:text-[4.5rem]">
            <KioskText
              tkey="kiosk.welcome.heading"
              secondaryClassName="mt-4 text-2xl font-medium sm:text-3xl"
            />
          </h1>

          <KioskText
            tkey="kiosk.welcome.support"
            as="p"
            className="mt-8 max-w-2xl text-xl leading-relaxed sm:text-2xl"
            secondaryClassName="mt-2 text-lg sm:text-xl"
          />

          <KioskPrimaryButton tkey="kiosk.welcome.start" onClick={start} className="mt-10" />

          <Link
            to="/patient-kiosk/conversation"
            className="mt-5 inline-flex min-h-16 items-center gap-3 rounded-full border border-border bg-background px-8 text-lg font-semibold transition-colors hover:bg-muted"
          >
            <MessageCircle aria-hidden="true" className="size-5 text-primary" />
            <span className={cn(language === "hi" && "deva")}>{t("kiosk.welcome.talk")}</span>
          </Link>

          <ListenButton
            className="mt-5"
            size="large"
            text={`${t("kiosk.welcome.heading")}. ${t("kiosk.welcome.support")}. ${t("kiosk.welcome.speakHint")}`}
          />

          <div className="mt-7 flex items-start gap-3.5">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-accent"
            >
              <Mic className="size-5 text-secondary" />
            </span>
            <div className={cn("text-lg leading-relaxed", language === "hi" && "deva")}>
              {bilingual ? (
                <>
                  <p lang="en">{tIn("en", "kiosk.welcome.speakHint")}</p>
                  <p lang="en" className="text-muted-foreground">
                    {tIn("en", "kiosk.welcome.typeHint")}
                  </p>
                  <p lang="hi" className="deva mt-2">
                    {tIn("hi", "kiosk.welcome.speakHint")}
                  </p>
                  <p lang="hi" className="deva text-muted-foreground">
                    {tIn("hi", "kiosk.welcome.typeHint")}
                  </p>
                </>
              ) : (
                <>
                  <p>{t("kiosk.welcome.speakHint")}</p>
                  <p className="text-muted-foreground">{t("kiosk.welcome.typeHint")}</p>
                </>
              )}
            </div>
          </div>

          <KioskProgress currentStep={1} variant="quiet" className="mt-9" />
        </div>

        {/* Visual column */}
        <figure className="media-frame animate-rise aspect-4/5 w-full max-h-[38rem] lg:aspect-3/4">
          <img
            src={heroPoster}
            alt={t("kiosk.welcome.imageAlt")}
            className="size-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,oklch(0.24_0.03_258/40%),transparent_60%)]"
          />
        </figure>
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <KioskTrustNote />
      </div>
    </div>
  );
}
