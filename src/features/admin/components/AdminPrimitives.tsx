import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { DemoNotice } from "./AdminStatus";
export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-3">
          <DemoNotice />
        </div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>
      {action}
    </div>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
      {" "}
      <div>
        {eyebrow && <p className="text-[11px] font-bold uppercase text-primary">{eyebrow}</p>}
        <h2 className="mt-1 text-lg font-semibold">{title}</h2>
      </div>
      {action}
    </div>
  );
}
export function SearchField({
  value,
  onChange,
  placeholder,
  label = placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label?: string;
}) {
  return (
    <label className="relative block min-w-0 flex-1">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-input bg-surface pl-10 pr-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </label>
  );
}
export function DemoFeedback({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-md border border-secondary/25 bg-accent px-4 py-3 text-sm font-medium text-accent-foreground"
    >
      {message}
    </div>
  );
}
