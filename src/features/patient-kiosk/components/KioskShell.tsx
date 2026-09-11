import type { ReactNode } from "react";
import { KioskHeader } from "./KioskHeader";

/**
 * Full-screen kiosk shell. Every patient screen renders inside this frame, so
 * the header, background and layout stay identical across the journey.
 */
export function KioskShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      {/* Soft organic brand wash — static, never animated. */}
      <div
        aria-hidden="true"
        className="pointer-events-none organic-blob -left-40 top-[-12rem] size-[34rem] bg-primary-soft/40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none organic-blob -right-48 bottom-[-14rem] size-[36rem] bg-accent/50"
      />

      <a href="#kiosk-main" className="skip-link">
        Skip to content
      </a>

      <div className="relative z-10 flex min-h-dvh flex-col">
        <KioskHeader />
        <main id="kiosk-main" tabIndex={-1} className="flex flex-1 flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
