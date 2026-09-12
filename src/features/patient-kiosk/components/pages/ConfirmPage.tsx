import { Link } from "@tanstack/react-router";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { stepNumber } from "@/features/patient-kiosk/session";
import { KioskStepContainer } from "../KioskStepContainer";
import { KioskStepNav } from "../KioskStepNav";
import { KioskSummarySection } from "../KioskSummarySection";
import { KioskText } from "../KioskText";
import { cn } from "@/lib/utils";

/** Read-back so the patient can correct anything before moving on. */
export function ConfirmPage() {
  const { session, language, t, confirmAnswer } = useKiosk();
  const profile = session?.profile ?? {};
  const answers = session?.answers ?? {};

  return (
    <KioskStepContainer step={stepNumber("confirm")}>
      <div className="mx-auto max-w-3xl">
        <KioskText
          tkey="kiosk.confirm.heading"
          as="h1"
          className="text-2xl font-semibold sm:text-3xl"
          secondaryClassName="text-lg font-normal"
        />
        <KioskText
          tkey="kiosk.confirm.support"
          as="p"
          className="mt-1 text-sm sm:text-base text-muted-foreground"
        />

        <div className="mt-3 sm:mt-4 space-y-3">
          <KioskSummarySection
            titleKey="kiosk.review.details"
            rows={[
              { labelKey: "kiosk.id.nameQuestion", value: profile["name"] ?? "" },
              { labelKey: "kiosk.id.age", value: profile["age"] ?? "" },
              { labelKey: "kiosk.id.phone", value: profile["phone"] ?? "" },
            ]}
          />
          <div>
            <KioskSummarySection
              titleKey="kiosk.review.words"
              rows={[
                { labelKey: "kiosk.case.q1", value: answers["story"] ?? "" },
              ]}
            />
            <Link
              to="/patient-kiosk/case-taking"
              className="mt-2.5 inline-flex min-h-11 items-center rounded-full border border-border bg-background px-5 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <span className={cn(language === "hi" && "deva")}>{t("kiosk.confirm.change")}</span>
            </Link>
          </div>
        </div>

        <KioskStepNav
          stepId="confirm"
          continueKey="kiosk.confirm.yes"
          onContinue={async () => {
            for (const id of Object.keys(answers)) await confirmAnswer(id);
          }}
        />
      </div>
    </KioskStepContainer>
  );
}
