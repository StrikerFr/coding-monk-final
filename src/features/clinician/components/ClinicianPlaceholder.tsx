import { Construction } from "lucide-react";

/**
 * Honest placeholder for clinician surfaces that are planned but not built yet.
 * Keeps the shell architecture stable so each page can be filled in later.
 */
export function ClinicianPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-[32px] font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-[16px] text-muted-foreground">{description}</p>
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-dashed border-border bg-surface px-5 py-4">
        <Construction aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" />
        <p className="text-[15px] text-muted-foreground">
          This screen is part of the planned clinician workflow and is not built yet. The dashboard,
          worklist and patient case review are available now.
        </p>
      </div>
    </div>
  );
}
