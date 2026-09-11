import type { ReactNode } from "react";
import { useLanguage } from "@/lib/language";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

/** Bilingual text block. Hindi leads, English follows as the quieter voice. */
export function Bi({
  hi: hiText,
  en: enText,
  className,
  hiClassName,
  enClassName,
  as: As = "span",
}: {
  hi: string;
  en: string;
  className?: string;
  hiClassName?: string;
  enClassName?: string;
  as?: "span" | "div" | "p";
}) {
  const { hi, en } = useLanguage();
  return (
    <As className={className}>
      {hi && (
        <span lang="hi" className={cn("deva block", hiClassName)}>
          {hiText}
        </span>
      )}
      {en && (
        <span
          lang="en"
          className={cn("block", hi ? cn("text-muted-foreground", enClassName) : enClassName)}
        >
          {enText}
        </span>
      )}
    </As>
  );
}

export function Eyebrow({ hi: hiText, en: enText }: { hi?: string; en: string }) {
  const { hi, en } = useLanguage();
  return (
    <p className="inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      <span aria-hidden="true" className="size-2 rounded-full bg-primary/70" />
      {hi && hiText && (
        <span lang="hi" className="deva text-sm tracking-normal">
          {hiText}
        </span>
      )}
      {hi && hiText && en && (
        <span aria-hidden="true" className="opacity-40">
          ·
        </span>
      )}
      {en && <span lang="en">{enText}</span>}
    </p>
  );
}

/** Heading pair used by every story section, so type scale stays consistent. */
export function SectionHeading({
  id,
  hi: hiText,
  en: enText,
  className,
}: {
  id?: string;
  hi: string;
  en: string;
  className?: string;
}) {
  const { hi, en } = useLanguage();
  return (
    <h2
      id={id}
      className={cn(
        "mt-5 text-3xl font-semibold leading-[1.15] sm:text-4xl lg:text-[2.9rem]",
        className,
      )}
    >
      {hi && (
        <span lang="hi" className="deva block">
          {hiText}
        </span>
      )}
      {en && (
        <span
          lang="en"
          className={
            hi ? "mt-3 block text-xl font-medium text-muted-foreground sm:text-2xl" : "block"
          }
        >
          {enText}
        </span>
      )}
    </h2>
  );
}

/** Scroll reveal wrapper — presentation only, content is always in the DOM. */
export function Reveal({
  children,
  className,
  delay = 0,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section";
}) {
  const { ref, shown } = useReveal<HTMLDivElement>(0.14);
  return (
    <As
      ref={ref as never}
      className={cn("reveal", shown && "reveal-in", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </As>
  );
}

/** Consistent outer section frame: rhythm, max width, generous gutters. */
export function Section({
  children,
  className,
  tone = "base",
  labelledBy,
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "base" | "sunken" | "ink";
  labelledBy?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "relative overflow-hidden px-6 py-20 sm:px-10 lg:px-16 lg:py-28",
        tone === "sunken" && "bg-surface-sunken",
        tone === "ink" && "bg-foreground text-background",
        className,
      )}
    >
      <div className="relative mx-auto max-w-[1400px]">{children}</div>
    </section>
  );
}
