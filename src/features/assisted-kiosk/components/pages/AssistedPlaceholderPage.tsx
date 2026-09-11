import { ArrowLeft, ClipboardList, FileText, HeartHandshake, Stethoscope } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
const details = {
  start: {
    eyebrow: "A2 · Start",
    title: "Start assisted intake",
    body: "The detailed intake setup will be built in a future phase.",
    icon: ClipboardList,
  },
  "case-taking": {
    eyebrow: "A3 · Case taking",
    title: "Assisted case-taking",
    body: "The detailed guided case-taking experience is not part of this build yet.",
    icon: HeartHandshake,
  },
  vitals: {
    eyebrow: "A4 · Vitals",
    title: "Capture vitals",
    body: "Vitals capture is prepared as a future staff workflow. No readings are collected here.",
    icon: Stethoscope,
  },
  documents: {
    eyebrow: "A5 · Documents",
    title: "Patient documents",
    body: "Document upload and processing are not connected in this frontend demonstration.",
    icon: FileText,
  },
  handoff: {
    eyebrow: "A6 · Handoff",
    title: "Prepare clinician handoff",
    body: "Handoff review will be built later. No clinician is notified from this demonstration.",
    icon: ClipboardList,
  },
} as const;
export type AssistedPlaceholderKind = keyof typeof details;
export function AssistedPlaceholderPage({ kind }: { kind: AssistedPlaceholderKind }) {
  const item = details[kind];
  const Icon = item.icon;
  return (
    <div className="mx-auto max-w-3xl">
      <header className="border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase text-primary">{item.eyebrow}</p>
        <h1 className="mt-2 text-[32px] font-semibold sm:text-[38px]">{item.title}</h1>
        <p className="mt-2 text-muted-foreground">{item.body}</p>
      </header>
      <section className="mt-8 border-y border-border py-10 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-soft/60 text-primary">
          <Icon className="size-6" />
        </span>
        <h2 className="mt-4 text-xl font-semibold">Workspace prepared</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Return to today’s queue to select a synthetic patient and manage the current assisted-care
          workload.
        </p>
        <Button asChild className="mt-6 min-h-12">
          <Link to="/assisted-kiosk">
            <ArrowLeft />
            Back to queue
          </Link>
        </Button>
      </section>
    </div>
  );
}
