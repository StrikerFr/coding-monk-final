import { useEffect, useId, useRef, useState } from "react";
import { FileText, Search, Stethoscope, ClipboardList } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { patientApi, usePatient } from "@/features/patient/patient-context";
import type { PatientSearchResult } from "@/features/patient/types";
import { cn } from "@/lib/utils";

const icons = {
  consultation: Stethoscope,
  report: FileText,
  document: FileText,
  intake: ClipboardList,
} as const;

export function PatientSearch({ className }: { className?: string }) {
  const { t } = usePatient();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const resultsId = `${inputId}-results`;
  useEffect(() => {
    let active = true;
    void patientApi.search(query).then((items) => active && setResults(items));
    return () => {
      active = false;
    };
  }, [query]);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={wrapRef} className={cn("relative w-full max-w-md", className)}>
      <label htmlFor={inputId} className="sr-only">
        {t("header.search")}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        id={inputId}
        role="combobox"
        aria-expanded={open && !!query}
        aria-controls={resultsId}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        placeholder={t("header.search")}
        className="h-11 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      />
      {open && query.trim() && (
        <div
          id={resultsId}
          role="listbox"
          className="absolute left-0 right-0 top-13 z-50 overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-lift"
        >
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No matching records</p>
          ) : (
            results.map((item) => {
              const Icon = icons[item.kind];
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-surface-sunken focus-visible:bg-surface-sunken"
                >
                  <Icon aria-hidden="true" className="mt-0.5 size-4 text-primary" />
                  <span>
                    <span className="block text-sm font-semibold">{item.title}</span>
                    <span className="block text-xs text-muted-foreground">{item.subtitle}</span>
                  </span>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
