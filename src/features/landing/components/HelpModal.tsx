import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/language";

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { hi, en } = useLanguage();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-6">
      <button
        type="button"
        aria-label={hi ? "बंद करें" : "Close"}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/35 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        className="surface-panel relative w-full max-w-xl rounded-4xl p-10 text-center"
      >
        <h2 id="help-title" className="text-3xl font-semibold">
          {hi && <span className="deva block">मदद चाहिए?</span>}
          {en && <span className="block text-2xl text-muted-foreground">Need assistance?</span>}
        </h2>
        <p className="mt-6 text-xl leading-relaxed">
          {hi && <span className="deva block">कृपया पास खड़े स्टाफ से पूछें।</span>}
          {en && (
            <span className="mt-2 block text-lg text-muted-foreground">
              Please ask a staff member nearby.
            </span>
          )}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="mt-9 min-h-16 w-full rounded-full bg-foreground px-10 text-xl font-semibold text-background transition-opacity hover:opacity-90"
        >
          {hi && <span className="deva">बंद करें</span>}
          {hi && en && (
            <span aria-hidden="true" className="px-2 opacity-50">
              /
            </span>
          )}
          {en && <span>Close</span>}
        </button>
      </div>
    </div>
  );
}
