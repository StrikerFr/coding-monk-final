import type { ReactNode } from "react";
import { KioskHeader } from "./KioskHeader";
import bgImage from "@/assets/care-cinematic.jpg";

/**
 * Full-screen kiosk shell. Every patient screen renders inside this frame, so
 * the header, background and layout stay identical across the journey.
 */
export function KioskShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Cinematic background — fixed so it never shifts during step transitions */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(2px) brightness(0.22)",
          transform: "scale(1.04)", /* hide blur edge artefact */
        }}
      />
      {/* Subtle tinted gradient layer for legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.06 258 / 0.92) 0%, oklch(0.12 0.04 290 / 0.85) 100%)",
        }}
      />
      {/* Soft organic accent blobs on top of the dark wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-40 top-[-12rem] z-0 size-[34rem] organic-blob bg-primary/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -right-48 bottom-[-14rem] z-0 size-[36rem] organic-blob bg-accent/15"
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
