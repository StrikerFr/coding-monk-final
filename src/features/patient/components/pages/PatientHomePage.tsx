import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderOpen,
  HeartHandshake,
  History,
  Stethoscope,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { patientApi, usePatient } from "@/features/patient/patient-context";
import type { PatientDashboard } from "@/features/patient/types";
import { PatientError, PatientLoading, PatientOffline } from "../PatientStates";

const recordIcons = {
  consultation: Stethoscope,
  report: FileText,
  document: FolderOpen,
  intake: ClipboardList,
} as const;
const quickLinks = [
  {
    to: "/patient/timeline",
    icon: History,
    key: "nav.timeline",
    detail: "See your health history",
  },
  { to: "/patient/reports", icon: FileText, key: "nav.reports", detail: "View available reports" },
  {
    to: "/patient/documents",
    icon: FolderOpen,
    key: "nav.documents",
    detail: "Your uploaded records",
  },
  {
    to: "/patient/intakes",
    icon: ClipboardList,
    key: "nav.intakes",
    detail: "Previous case information",
  },
] as const;

export function PatientHomePage() {
  const { profile, t, language, connection } = usePatient();
  const [dashboard, setDashboard] = useState<PatientDashboard | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void patientApi
      .getDashboard()
      .then((data) => active && setDashboard(data))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [attempt]);
  if (failed)
    return (
      <PatientError
        onRetry={() => {
          setFailed(false);
          setAttempt((value) => value + 1);
        }}
      />
    );
  if (!dashboard) return <PatientLoading />;
  const latest = dashboard.latestConsultation;
  return (
    <div className={language === "hi" ? "deva" : ""}>
      {connection === "offline" && <PatientOffline lastUpdated={dashboard.lastUpdated} />}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-sm font-semibold uppercase text-primary">{t("welcome.eyebrow")}</p>
          <h1 className="mt-2 text-[32px] font-semibold leading-tight sm:text-[40px]">
            {language === "hi" ? t("welcome.title") : `Good morning, ${profile.name.split(" ")[0]}`}
          </h1>
          <p className="mt-2 max-w-xl text-[16px] text-muted-foreground">{t("welcome.body")}</p>
        </div>
        <p className="max-w-xs text-xs text-muted-foreground">{t("demo")}</p>
      </header>

      <section
        className="mt-7 grid overflow-hidden rounded-lg border border-border bg-surface shadow-soft lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,.8fr)]"
        aria-labelledby="latest-consultation"
      >
        <div className="p-5 sm:p-7 lg:p-9">
          <p className="text-xs font-semibold uppercase text-primary">{t("latest.eyebrow")}</p>
          <div className="mt-5 flex items-start gap-4">
            <span
              aria-hidden="true"
              className="hidden size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary sm:flex"
            >
              <Stethoscope className="size-6" />
            </span>
            <div>
              <h2 id="latest-consultation" className="text-2xl font-semibold sm:text-[32px]">
                {latest.clinic}
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays aria-hidden="true" className="size-4" />
                {latest.date}
              </p>
              <p className="mt-6 text-lg font-semibold">{latest.concern}</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-accent-foreground">
                <CheckCircle2 aria-hidden="true" className="size-4" />
                {t("latest.status")}
              </p>
              <Button asChild className="mt-7 min-h-11">
                <Link to="/patient/timeline">
                  {t("latest.view")}
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t border-border bg-surface-sunken p-5 sm:p-7 lg:border-l lg:border-t-0">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {t("journey.title")}
          </p>
          <ol className="mt-5 space-y-0">
            {dashboard.timeline.slice(0, 3).map((event, index) => (
              <li
                key={event.id}
                className="relative grid grid-cols-[48px_18px_1fr] gap-2 pb-5 last:pb-0"
              >
                <span className="text-xs font-semibold text-muted-foreground">{event.date}</span>
                <span className="relative mt-0.5 size-3 rounded-full border-[3px] border-surface-sunken bg-secondary after:absolute after:left-[3px] after:top-3 after:h-[calc(100%+1.25rem)] after:w-px after:bg-border last:after:hidden" />
                <span>
                  <span className="block text-sm font-semibold">{event.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{event.detail}</span>
                </span>
              </li>
            ))}
          </ol>
          <Button asChild variant="link" className="mt-4 h-auto p-0">
            <Link to="/patient/timeline">
              {t("journey.view")}
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <section aria-labelledby="quick-access" className="mt-10">
        <div className="flex items-center justify-between">
          <h2 id="quick-access" className="text-2xl font-semibold">
            {t("quick.title")}
          </h2>
        </div>
        <div className="mt-4 grid border-y border-border sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map(({ to, icon: Icon, key, detail }, index) => (
            <Link
              key={to}
              to={to}
              className={`group flex min-h-32 items-start gap-3 py-5 pr-4 transition-colors hover:bg-surface-sunken sm:px-4 ${index > 0 ? "border-t border-border sm:border-t-0 sm:border-l" : ""} ${index === 2 ? "sm:border-l-0 lg:border-l" : ""}`}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft/55 text-primary">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span>
                <span className="flex items-center gap-2 font-semibold">
                  {t(key)}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-1"
                  />
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{detail}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)]">
        <section aria-labelledby="recent-records">
          <h2 id="recent-records" className="text-2xl font-semibold">
            {t("records.title")}
          </h2>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {dashboard.recentRecords.slice(0, 3).map((record) => {
              const Icon = recordIcons[record.kind];
              const route =
                record.kind === "report"
                  ? "/patient/reports"
                  : record.kind === "document"
                    ? "/patient/documents"
                    : record.kind === "intake"
                      ? "/patient/intakes"
                      : "/patient/timeline";
              return (
                <li key={record.id}>
                  <Link
                    to={route}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 py-4"
                  >
                    <span className="flex size-10 items-center justify-center rounded-md bg-muted text-primary">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <span>
                      <span className="block font-semibold">{record.title}</span>
                      <span className="block text-sm text-muted-foreground">
                        {record.description}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-sm font-medium">{record.date}</span>
                      <span className="text-xs text-accent-foreground">{record.status}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
        <section aria-labelledby="documents-preview">
          <p className="text-xs font-semibold uppercase text-primary">{t("documents.title")}</p>
          <h2 id="documents-preview" className="mt-2 text-2xl font-semibold">
            {t("documents.count")}
          </h2>
          <ul className="mt-5 divide-y divide-border border-y border-border">
            {dashboard.documents.map((document) => (
              <li key={document.id} className="flex items-center gap-3 py-3">
                <FileText aria-hidden="true" className="size-5 text-primary" />
                <span>
                  <span className="block text-sm font-semibold">{document.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    Uploaded · {document.date}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <Button asChild variant="link" className="mt-4 h-auto p-0">
            <Link to="/patient/documents">
              {t("documents.view")}
              <ArrowRight />
            </Link>
          </Button>
        </section>
      </div>

      <section
        className="mt-10 grid overflow-hidden rounded-lg border border-border bg-foreground text-background lg:grid-cols-[1fr_auto]"
        aria-labelledby="privacy-title"
      >
        <div className="p-6 sm:p-8">
          <HeartHandshake aria-hidden="true" className="size-7 text-primary-soft" />
          <p className="mt-5 text-xs font-semibold uppercase text-background/65">
            {t("privacy.title")}
          </p>
          <h2 id="privacy-title" className="mt-2 max-w-xl text-2xl font-semibold">
            {t("privacy.body")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-background/70">{t("privacy.note")}</p>
        </div>
        <div className="flex items-center border-t border-background/15 p-6 lg:border-l lg:border-t-0">
          <Button asChild variant="secondary" className="min-h-11">
            <Link to="/patient/consents">
              {t("privacy.action")}
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
