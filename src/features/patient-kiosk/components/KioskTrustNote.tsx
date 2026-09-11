import { ListChecks, ShieldCheck, UserRound } from "lucide-react";
import { KioskText } from "./KioskText";
import type { KioskTranslationKey } from "@/features/patient-kiosk/translations/en";

const notes: Array<{
  icon: typeof ShieldCheck;
  title: KioskTranslationKey;
  body: KioskTranslationKey;
}> = [
  { icon: ShieldCheck, title: "kiosk.trust.privacy.title", body: "kiosk.trust.privacy.body" },
  { icon: ListChecks, title: "kiosk.trust.guided.title", body: "kiosk.trust.guided.body" },
  { icon: UserRound, title: "kiosk.trust.staff.title", body: "kiosk.trust.staff.body" },
];

/** Quiet reassurance strip. No certifications, no absolute security claims. */
export function KioskTrustNote() {
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {notes.map(({ icon: Icon, title, body }) => (
        <li
          key={title}
          className="flex items-start gap-3.5 rounded-3xl border border-border bg-surface/70 px-5 py-4"
        >
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-muted"
          >
            <Icon className="size-5 text-secondary" />
          </span>
          <div className="min-w-0">
            <KioskText
              tkey={title}
              className="text-base font-semibold"
              secondaryClassName="text-sm"
            />
            <KioskText
              tkey={body}
              as="p"
              className="mt-1.5 text-sm leading-relaxed text-muted-foreground"
              secondaryClassName="text-sm"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
