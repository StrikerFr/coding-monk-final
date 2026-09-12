import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FileText, Search, User, ClipboardList } from "lucide-react";
import { clinicianApi } from "@/features/clinician/api";
import type { SearchResult } from "@/features/clinician/types";
import { cn } from "@/lib/utils";

/** Frontend-only search over synthetic demo data. */
export function GlobalSearch({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchId = useId();
  const resultsId = `${searchId}-results`;
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    clinicianApi.search(query).then((r) => {
      if (active) setResults(r);
    });
    return () => {
      active = false;
    };
  }, [query]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const icons = { patient: User, case: ClipboardList, document: FileText } as const;
  const groups = ["patient", "case", "document"] as const;
  const groupLabels = { patient: "Patients", case: "Cases", document: "Documents" } as const;

  const select = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    navigate({ to: "/clinician/patients/$id", params: { id: result.patientId } });
  };

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-md", className)}>
      <label htmlFor={searchId} className="sr-only">
        Search patients, cases, or records
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        id={searchId}
        type="search"
        role="combobox"
        aria-expanded={open && query.length > 0}
        aria-controls={resultsId}
        autoComplete="off"
        value={query}
        placeholder="Search patients, cases, or records"
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground hover:border-primary/35 focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      />

      {open && query.trim().length > 0 && (
        <div
          id={resultsId}
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-lg border border-border bg-popover shadow-soft"
        >
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No matches in demonstration data.
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto py-1">
              {groups.map((group) => {
                const groupResults = results.filter((result) => result.kind === group);
                if (groupResults.length === 0) return null;
                return (
                  <section key={group} aria-labelledby={`search-group-${group}`}>
                    <h2
                      id={`search-group-${group}`}
                      className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase text-muted-foreground"
                    >
                      {groupLabels[group]}
                    </h2>
                    <ul>
                      {groupResults.map((result) => {
                        const Icon = icons[result.kind];
                        return (
                          <li key={result.id}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={false}
                              onClick={() => select(result)}
                              className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-sunken focus-visible:bg-surface-sunken"
                            >
                              <Icon
                                aria-hidden="true"
                                className="mt-0.5 size-4 text-muted-foreground"
                              />
                              <span>
                                <span className="block text-sm font-medium">{result.title}</span>
                                <span className="block text-xs text-muted-foreground">
                                  {result.subtitle}
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
