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
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-4 sm:px-8 sm:py-6">
      <div className="grid flex-1 items-center gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        {/* Message column */}
        <div className="animate-rise flex flex-col items-start">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            {tIn("en", "kiosk.welcome.eyebrow").toUpperCase()}
          </p>

          <h1 className="mt-3 text-3xl font-semibold leading-[1.12] sm:text-4xl lg:text-5xl">
            <KioskText
              tkey="kiosk.welcome.heading"
              secondaryClassName="mt-2 text-xl font-medium sm:text-2xl"
            />
          </h1>

          <KioskText
            tkey="kiosk.welcome.support"
            as="p"
            className="mt-3 max-w-xl text-base leading-relaxed sm:text-lg text-muted-foreground"
            secondaryClassName="mt-1 text-sm sm:text-base"
          />

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <KioskPrimaryButton tkey="kiosk.welcome.start" onClick={start} className="max-w-xs" />

            <Link
              to="/patient-kiosk/conversation"
              className="inline-flex min-h-13 sm:min-h-15 items-center gap-2.5 rounded-full border border-border bg-background px-6 text-base font-semibold transition-colors hover:bg-muted"
            >
              <MessageCircle aria-hidden="true" className="size-5 text-primary" />
              <span className={cn(language === "hi" && "deva")}>{t("kiosk.welcome.talk")}</span>
            </Link>
          </div>

          <ListenButton
            className="mt-3"
            size="large"
            text={`${t("kiosk.welcome.heading")}. ${t("kiosk.welcome.support")}. ${t("kiosk.welcome.speakHint")}`}
          />

          <div className="mt-3.5 flex items-start gap-3">
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-accent"
            >
              <Mic className="size-4 text-secondary" />
            </span>
            <div className={cn("text-sm sm:text-base leading-relaxed", language === "hi" && "deva")}>
              {bilingual ? (
                <>
                  <p lang="en">{tIn("en", "kiosk.welcome.speakHint")}</p>
                  <p lang="en" className="text-muted-foreground">
                    {tIn("en", "kiosk.welcome.typeHint")}
                  </p>
                  <p lang="hi" className="deva mt-1">
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

          <KioskProgress currentStep={1} variant="quiet" className="mt-4" />
        </div>

        {/* Visual column */}
        <figure className="media-frame animate-rise aspect-4/5 w-full max-h-[26rem] lg:aspect-4/5">
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

      <div className="mt-5 border-t border-border pt-4">
        <KioskTrustNote />
      </div>
    </div>
  );
}
