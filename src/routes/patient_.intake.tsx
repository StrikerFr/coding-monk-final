import { createFileRoute, Link } from "@tanstack/react-router";
import { LanguageProvider, useLanguage } from "@/lib/language";
import { VoiceVisual } from "@/features/landing/components/VoiceVisual";

export const Route = createFileRoute("/patient_/intake")({
  head: () => ({
    meta: [
      { title: "Voice Intake - MediKiosk" },
      {
        name: "description",
        content:
          "Tell MediKiosk what is bothering you in Hindi or English — no typing needed. Your words reach your doctor.",
      },
      { property: "og:title", content: "Voice Intake - MediKiosk" },
      {
        property: "og:description",
        content:
          "Speak your symptoms in Hindi or English. MediKiosk prepares a summary for your doctor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <LanguageProvider>
      <IntakePlaceholder />
    </LanguageProvider>
  ),
});

/** Placeholder screen. Real voice case-taking arrives in a later step. */
function IntakePlaceholder() {
  const { hi, en } = useLanguage();

  return (
    <main className="grid min-h-dvh place-items-center px-6 py-16 text-center">
      <div className="flex max-w-2xl flex-col items-center">
        <VoiceVisual state="listening" className="size-56 sm:size-72" />
        <h1 className="mt-14 text-3xl font-semibold sm:text-4xl">
          {hi && <span className="deva block">हम सुन रहे हैं।</span>}
          {en && (
            <span className={hi ? "mt-3 block text-xl text-muted-foreground" : "block"}>
              We&rsquo;re listening.
            </span>
          )}
        </h1>
        <p className="mt-6 text-xl leading-relaxed text-muted-foreground">
          {hi && <span className="deva block text-foreground">यह हिस्सा जल्द तैयार होगा।</span>}
          {en && <span className="mt-2 block">This part is coming soon.</span>}
        </p>
        <Link
          to="/"
          className="mt-12 inline-flex min-h-16 items-center rounded-full border border-border bg-surface px-10 text-xl font-semibold transition-colors hover:bg-muted"
        >
          {hi && <span className="deva">वापस जाएं</span>}
          {hi && en && (
            <span aria-hidden="true" className="px-2 opacity-50">
              /
            </span>
          )}
          {en && <span>Go back</span>}
        </Link>
      </div>
    </main>
  );
}
