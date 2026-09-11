import { cn } from "@/lib/utils";

/**
 * Media slot for a short, silent, looping clip of a patient speaking to a kiosk.
 *
 * Final assets get dropped in later: pass `src` (mp4/webm) and it plays muted,
 * looping, inline. Until then the poster image carries the whole story, so the
 * section looks complete with no video file present. No placeholder URLs.
 */
export function HumanVideo({
  poster,
  posterAlt,
  src,
  caption,
  className,
  eager = false,
  zoomOnHover = false,
  width,
  height,
}: {
  poster: string;
  posterAlt: string;
  src?: string | undefined;
  caption?: React.ReactNode | undefined;
  className?: string | undefined;
  eager?: boolean | undefined;
  zoomOnHover?: boolean | undefined;
  width: number;
  height: number;
}) {
  const mediaClass = cn(
    "size-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-calm)]",
    zoomOnHover && "group-hover:scale-[1.035]",
  );

  return (
    <figure className={cn("media-frame ring-1 ring-border/60", className)}>
      {src ? (
        <video
          className={mediaClass}
          poster={poster}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={posterAlt}
        />
      ) : (
        <img
          src={poster}
          alt={posterAlt}
          width={width}
          height={height}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          className={mediaClass}
        />
      )}

      {/* Warm, calming wash keeps every overlay legible over any final asset. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,oklch(0.24_0.03_258/45%),transparent_58%)]"
      />
      {/* Subtle inner edge gives the image a sense of depth in the interface. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_oklch(1_0_0/22%)]"
      />

      {caption ? (
        <figcaption className="absolute inset-x-4 bottom-4 flex justify-center sm:inset-x-6 sm:bottom-6">
          <span className="rounded-full bg-surface/92 px-5 py-3 text-center text-lg font-semibold text-foreground shadow-[var(--shadow-soft)] backdrop-blur-sm sm:text-xl">
            {caption}
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}
