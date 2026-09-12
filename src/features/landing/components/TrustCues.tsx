import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

function Icon({ path }: { path: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 shrink-0 text-secondary"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

const CUES = [
  {
    hi: "आसान",
    en: "Easy for everyone",
    path: "M4 12.5l5 5L20 6.5",
  },
  {
    hi: "बोलकर",
    en: "Just speak",
    path: "M12 3.5a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0v-4a3 3 0 0 1 3-3zM5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21",
  },
  {
    hi: "सुरक्षित",
    en: "Private & secure",
    path: "M12 3.5l6.5 2.5v5.5c0 4-2.8 7.2-6.5 8.5-3.7-1.3-6.5-4.5-6.5-8.5V6z",
  },
];

export function TrustCues({ className }: { className?: string }) {
  const { hi, en } = useLanguage();

  return (
    <ul className={cn("flex flex-wrap items-center gap-x-6 gap-y-3", className)}>
      {CUES.map((cue) => (
        <li key={cue.en} className="flex items-center gap-2.5">
          <Icon path={cue.path} />
          <span className="flex items-baseline gap-2">
            {hi && <span className="deva text-base font-semibold">{cue.hi}</span>}
            {en && (
              <span className={hi ? "text-sm text-muted-foreground" : "text-base font-semibold"}>
                {cue.en}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
