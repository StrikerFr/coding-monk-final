import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderOpen,
  HeartHandshake,
  History,
  Inbox,
  Languages,
  Lock,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { patientApi, usePatient } from "@/features/patient/patient-context";
import type {
  PatientConsent,
  PatientDocument,
  PatientIntake,
  PatientRecord,
  PatientTimelineEvent,
} from "@/features/patient/types";

export type PatientSection =
  "timeline" | "reports" | "documents" | "intakes" | "consents" | "profile" | "notifications";

const sectionInfo = {
  timeline: {
    eyebrow: "Your health journey",
    title: "My Timeline",
    description: "Every step of your consultations, in the order it happened.",
    icon: History,
    empty: "Your visits will appear here once you finish a check-in.",
  },
  reports: {
    eyebrow: "Your records",
    title: "Reports",
    description: "Consultation reports your doctor has reviewed and signed.",
    icon: FileText,
    empty: "No signed reports yet. A report appears here after your doctor signs it.",
  },
  documents: {
    eyebrow: "Your records",
    title: "Documents",
    description: "Prescriptions and papers you added, kept together in one place.",
    icon: FolderOpen,
    empty: "No documents yet. Papers you add at the kiosk will show up here.",
  },
  intakes: {
    eyebrow: "Information you shared",
    title: "My Intakes",
    description: "What you told the kiosk before each consultation.",
    icon: ClipboardList,
    empty: "No check-ins yet. Start one at the kiosk and it will be listed here.",
  },
  consents: {
    eyebrow: "Privacy & control",
    title: "Consent",
    description: "How your health information is used and who can see it.",
    icon: HeartHandshake,
    empty: "Nothing to review yet.",
  },
  profile: {
    eyebrow: "Your preferences",
    title: "Profile",
    description: "Your details, language and accessibility preferences.",
    icon: UserRound,
    empty: "",
  },
  notifications: {
    eyebrow: "Recent activity",
    title: "Notifications",
    description: "Updates about your visits and records.",
    icon: Bell,
    empty: "No updates yet.",
  },
} as const;

export function PatientSectionPage({ section }: { section: PatientSection }) {
  const info = sectionInfo[section];
  const Icon = info.icon;
  const { profile, language, setLanguage, notifications, markAllRead, unreadCount } = usePatient();
  const [loading, setLoading] = useState(section !== "profile" && section !== "notifications");
  const [failed, setFailed] = useState(false);
  const [timeline, setTimeline] = useState<PatientTimelineEvent[]>([]);
  const [reports, setReports] = useState<PatientRecord[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [intakes, setIntakes] = useState<PatientIntake[]>([]);
  const [consent, setConsent] = useState<PatientConsent | null>(null);
  const [docFilter, setDocFilter] = useState<"all" | "Report" | "Prescription">("all");

  useEffect(() => {
    let active = true;
    const load = <T,>(run: Promise<T>, apply: (value: T) => void) => {
      setLoading(true);
      setFailed(false);
      void run
        .then((value) => {
          if (!active) return;
          apply(value);
          setLoading(false);
        })
        .catch(() => {
          if (!active) return;
          setFailed(true);
          setLoading(false);
        });
    };
    if (section === "timeline") load(patientApi.getTimeline(), setTimeline);
    if (section === "reports") load(patientApi.getReports(), setReports);
    if (section === "documents") load(patientApi.getDocuments(), setDocuments);
    if (section === "intakes") load(patientApi.getIntakes(), setIntakes);
    if (section === "consents") load(patientApi.getConsents(), setConsent);
    return () => {
      active = false;
    };
  }, [section]);

  const visibleDocuments = useMemo(
    () => (docFilter === "all" ? documents : documents.filter((item) => item.type === docFilter)),
    [documents, docFilter],
  );

  const count = {
    timeline: timeline.length,
    reports: reports.length,
    documents: documents.length,
    intakes: intakes.length,
    consents: 0,
    profile: 0,
    notifications: notifications.length,
  }[section];

  const stats: Array<{ label: string; value: string }> =
    section === "timeline"
      ? [{ label: "Events recorded", value: String(timeline.length) }]
      : section === "reports"
        ? [
            { label: "Signed reports", value: String(reports.length) },
            { label: "Latest", value: reports[0]?.date ?? "—" },
          ]
        : section === "documents"
          ? [
              { label: "Prescriptions", value: String(documents.filter((d) => d.type === "Prescription").length) },
              { label: "Reports", value: String(documents.filter((d) => d.type === "Report").length) },
            ]
          : section === "intakes"
            ? [
                { label: "Check-ins", value: String(intakes.length) },
                { label: "Latest", value: intakes[0]?.date ?? "—" },
              ]
            : section === "notifications"
              ? [
                  { label: "Updates", value: String(notifications.length) },
                  { label: "Unread", value: String(unreadCount) },
                ]
              : [];

  const body = () => {
    if (loading) return <LoadingBlock />;
    if (failed)
      return (
        <EmptyState
          icon={Inbox}
          title="We could not load this right now"
          detail="Please check your connection and open the page again."
        />
      );

    if (section === "timeline")
      return timeline.length === 0 ? (
        <EmptyState icon={History} title="Nothing here yet" detail={info.empty} action />
      ) : (
        <ol className="mt-8 space-y-4 border-l border-border pl-6">
          {timeline.map((event) => (
            <li key={event.id} className="relative">
              <span className="absolute -left-[31px] top-6 size-3 rounded-full bg-primary ring-4 ring-background" />
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex gap-4 p-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft/60 text-primary">
                    {event.kind === "report" ? (
                      <FileText className="size-5" />
                    ) : (
                      <Stethoscope className="size-5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {event.date}
                    </p>
                    <h2 className="mt-1 font-semibold">{event.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{event.detail}</p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      );

    if (section === "reports")
      return reports.length === 0 ? (
        <EmptyState icon={FileText} title="No signed reports yet" detail={info.empty} action />
      ) : (
        <Accordion type="single" collapsible className="mt-8 space-y-3">
          {reports.map((report) => (
            <AccordionItem
              key={report.id}
              value={report.id}
              className="rounded-lg border border-border bg-card px-5"
            >
              <AccordionTrigger className="text-left">
                <span className="flex min-w-0 flex-1 flex-col gap-1 pr-3">
                  <span className="truncate font-semibold">{report.title}</span>
                  <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    {report.date}
                    <Badge variant="secondary">{report.status}</Badge>
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {report.sections && report.sections.length > 0 ? (
                  <dl className="grid gap-4 pb-2">
                    {report.sections.map((part) => (
                      <div key={`${report.id}-${part.heading}`}>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {part.heading}
                        </dt>
                        <dd className="mt-1 text-sm leading-relaxed">{part.content}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="pb-2 text-sm text-muted-foreground">{report.description}</p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );

    if (section === "documents")
      return documents.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No documents yet" detail={info.empty} action />
      ) : (
        <div className="mt-8">
          <div className="flex flex-wrap gap-2">
            {(["all", "Report", "Prescription"] as const).map((option) => (
              <Button
                key={option}
                size="sm"
                variant={docFilter === option ? "default" : "outline"}
                onClick={() => setDocFilter(option)}
              >
                {option === "all" ? "All" : `${option}s`}
              </Button>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {visibleDocuments.map((item) => (
              <Card key={item.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex gap-4 p-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <FileText className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{item.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{item.date}</p>
                    <Badge variant="secondary" className="mt-2">
                      {item.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );

    if (section === "intakes")
      return intakes.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No check-ins yet" detail={info.empty} action />
      ) : (
        <div className="mt-8 grid gap-4">
          {intakes.map((item) => (
            <Card key={item.id} className="transition-shadow hover:shadow-md">
              <CardContent className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex min-w-0 gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft/60 text-primary">
                    <ClipboardList className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{item.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Information you shared before your consultation
                    </p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm font-medium">{item.date}</p>
                  <Badge variant="secondary" className="mt-1">
                    {item.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );

    if (section === "consents")
      return (
        <div className="mt-8 grid gap-4">
          <ConsentCard
            icon={Stethoscope}
            title="Shared with your clinician"
            detail="The answers you give at the kiosk and your signed reports are shown to the doctor who sees you at this clinic."
            state="Active"
          />
          <ConsentCard
            icon={Lock}
            title="Kept private"
            detail="Your records are not shared with anyone outside this clinic, and are never used for advertising."
            state="Always on"
          />
          <ConsentCard
            icon={ShieldCheck}
            title="Every action is recorded"
            detail="Each time your record is opened or signed, it is written to your history so you can see it."
            state="Active"
          />
          <Card>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <h2 className="font-semibold">Last check-in</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {consent?.lastReviewed ?? "—"}
                </p>
              </div>
              <Button disabled>Changing consent is not available yet</Button>
            </CardContent>
          </Card>
        </div>
      );

    if (section === "profile")
      return (
        <div className="mt-8 grid gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-semibold">
                {(profile.name || "?").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold">
                  {profile.name || "Not recorded yet"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {profile.age > 0 ? `${profile.age} years` : "Age not recorded"} ·{" "}
                  {profile.id || "No patient ID"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-4 p-6">
              <div className="flex items-center gap-2">
                <Languages className="size-5 text-primary" />
                <h2 className="font-semibold">Language</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Pages and spoken help use this language.
              </p>
              <div className="flex gap-2">
                <Button
                  variant={language === "hi" ? "default" : "outline"}
                  onClick={() => setLanguage("hi")}
                >
                  हिन्दी
                </Button>
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  onClick={() => setLanguage("en")}
                >
                  English
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <PreferenceCard
              icon={Settings}
              title="Accessibility"
              detail="Adjust text size, contrast and motion from the control in the header."
            />
            <PreferenceCard
              icon={Bell}
              title="Notifications"
              detail="See updates about your visits."
              to="/patient/notifications"
            />
            <PreferenceCard
              icon={HeartHandshake}
              title="Privacy & consent"
              detail="Review how your information is used."
              to="/patient/consents"
            />
            <PreferenceCard
              icon={FileText}
              title="Reports"
              detail="Read the reports your doctor signed."
              to="/patient/reports"
            />
          </div>
        </div>
      );

    return notifications.length === 0 ? (
      <EmptyState icon={Bell} title="No updates yet" detail={info.empty} />
    ) : (
      <div className="mt-8">
        <div className="flex justify-end">
          <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            Mark all read
          </Button>
        </div>
        <div className="mt-4 grid gap-3">
          {notifications.map((note) => (
            <Card key={note.id} className={note.unread ? "border-primary/40" : undefined}>
              <CardContent className="flex gap-3 p-5">
                {note.unread ? (
                  <span
                    className="mt-2 size-2 shrink-0 rounded-full bg-primary"
                    aria-label="Unread"
                  />
                ) : (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" />
                )}
                <div className="min-w-0">
                  <h2 className="font-semibold">{note.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {note.detail} · {note.time}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="rounded-xl border border-border bg-surface-sunken p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {info.eyebrow}
            </p>
            <div className="mt-3 flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary-soft/60 text-primary">
                <Icon className="size-6" />
              </span>
              <div className="min-w-0">
                <h1 className="text-[30px] font-semibold leading-tight sm:text-[38px]">
                  {info.title}
                </h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">{info.description}</p>
              </div>
            </div>
          </div>
          {count > 0 ? <Badge variant="secondary">{count}</Badge> : null}
        </div>
        {stats.length > 0 && !loading ? (
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border bg-card px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-lg font-semibold">{stat.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </header>
      {body()}
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="mt-8 grid gap-4">
      {[0, 1, 2].map((key) => (
        <Card key={key}>
          <CardContent className="flex gap-4 p-5">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  detail,
  action,
}: {
  icon: typeof Bell;
  title: string;
  detail: string;
  action?: boolean;
}) {
  return (
    <Card className="mt-8 border-dashed">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft/60 text-primary">
          <Icon className="size-6" />
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{detail}</p>
        {action ? (
          <Button asChild className="mt-2">
            <Link to="/patient-kiosk">Start a check-in</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ConsentCard({
  icon: Icon,
  title,
  detail,
  state,
}: {
  icon: typeof Bell;
  title: string;
  detail: string;
  state: string;
}) {
  return (
    <Card>
      <CardContent className="flex gap-4 p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft/60 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{title}</h2>
            <Badge variant="secondary">{state}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PreferenceCard({
  icon: Icon,
  title,
  detail,
  to,
}: {
  icon: typeof Settings;
  title: string;
  detail: string;
  to?: "/patient/consents" | "/patient/notifications" | "/patient/reports";
}) {
  const inner = (
    <CardContent className="flex h-full gap-3 p-5">
      <Icon className="size-5 shrink-0 text-primary" />
      <div className="min-w-0">
        <strong className="block">{title}</strong>
        <span className="mt-1 block text-sm text-muted-foreground">{detail}</span>
      </div>
    </CardContent>
  );
  return to ? (
    <Card className="transition-shadow hover:shadow-md">
      <Link to={to} className="block h-full">
        {inner}
      </Link>
    </Card>
  ) : (
    <Card>{inner}</Card>
  );
}
