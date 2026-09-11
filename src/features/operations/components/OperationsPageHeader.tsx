import type { ReactNode } from "react";
export function OperationsPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-sm border border-primary/25 bg-primary/8 px-2 py-1 text-[10px] font-bold uppercase text-primary">
            Demo environment
          </span>
          <span className="text-xs text-muted-foreground">Synthetic operations</span>
        </div>
        <h1 className="text-[32px] font-semibold leading-tight">{title}</h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  );
}
