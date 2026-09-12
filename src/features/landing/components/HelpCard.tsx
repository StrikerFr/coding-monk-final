import { useLanguage } from "@/lib/language";

export function HelpCard({ onOpen }: { onOpen: () => void }) {
  const { hi, en } = useLanguage();

  return (
    <section className="px-6 pb-16 sm:px-10 lg:px-16" aria-labelledby="help-heading">
      <div className="surface-panel mx-auto flex max-w-[1000px] flex-col items-center gap-6 rounded-4xl px-8 py-10 text-center sm:flex-row sm:justify-between sm:gap-8 sm:text-left">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-full bg-accent"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-7 text-secondary"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="3.4" />
              <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
            </svg>
          </span>
          <div>
            <h2 id="help-heading" className="text-2xl font-semibold">
              {hi && <span className="deva block">मदद चाहिए?</span>}
              {en && (
                <span
                  className={hi ? "block text-base font-medium text-muted-foreground" : "block"}
                >
                  Need help?
                </span>
              )}
            </h2>
            <p className="mt-2 text-lg leading-relaxed">
              {hi && <span className="deva block">पास खड़े स्टाफ से पूछें।</span>}
              {en && (
                <span className={hi ? "mt-1 block text-base text-muted-foreground" : "block"}>
                  Ask a staff member nearby.
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="min-h-14 w-full shrink-0 rounded-full border border-border bg-background px-8 text-lg font-semibold transition-all duration-300 ease-[var(--ease-calm)] hover:-translate-y-0.5 hover:bg-muted sm:w-auto"
        >
          {hi && <span className="deva">मदद लें</span>}
          {hi && en && (
            <span aria-hidden="true" className="px-2 opacity-50">
              /
            </span>
          )}
          {en && <span>Get help</span>}
        </button>
      </div>
    </section>
  );
}
