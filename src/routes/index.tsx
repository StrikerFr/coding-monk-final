import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LanguageProvider } from "@/lib/language";
import { MediKioskHeader } from "@/features/landing/components/MediKioskHeader";
import { HeroExperience } from "@/features/landing/components/HeroExperience";
import { HowItWorks } from "@/features/landing/components/HowItWorks";
import { SpeakSection } from "@/features/landing/components/SpeakSection";
import { BuiltForIndia } from "@/features/landing/components/BuiltForIndia";
import { AyushSection } from "@/features/landing/components/AyushSection";
import { WordsToStructure } from "@/features/landing/components/WordsToStructure";
import { DocumentsSection } from "@/features/landing/components/DocumentsSection";
import { ClinicianHandoff } from "@/features/landing/components/ClinicianHandoff";
import { TrustSection } from "@/features/landing/components/TrustSection";
import { EcosystemSection } from "@/features/landing/components/EcosystemSection";
import { AccessibilitySection } from "@/features/landing/components/AccessibilitySection";
import { AudienceSection } from "@/features/landing/components/AudienceSection";
import { SystemWorkflow } from "@/features/landing/components/SystemWorkflow";
import { BuiltWithCare } from "@/features/landing/components/BuiltWithCare";
import { FinalCta } from "@/features/landing/components/FinalCta";
import { HelpCard } from "@/features/landing/components/HelpCard";
import { SiteFooter } from "@/features/landing/components/SiteFooter";
import { HelpModal } from "@/features/landing/components/HelpModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediKiosk - Tell us what's bothering you" },
      {
        name: "description",
        content:
          "MediKiosk is a calm, voice-first patient case-taking experience. Speak your concern in Hindi or English — no typing — and your clinician receives a structured case.",
      },
      { property: "og:title", content: "MediKiosk - Tell us what's bothering you" },
      {
        property: "og:description",
        content:
          "Speak your problem in Hindi or English at the kiosk. No typing needed. Your clinician receives a clear, structured case.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://medikiosk.vercel.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://medikiosk.vercel.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "MediKiosk",
          url: "https://medikiosk.vercel.app/",
          description:
            "MediKiosk is a calm, voice-first patient case-taking experience in Hindi or English.",
        }),
      },
    ],
  }),
  component: () => (
    <LanguageProvider>
      <WelcomePage />
    </LanguageProvider>
  ),
});

function WelcomePage() {
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);
  const start = () => navigate({ to: "/patient-kiosk" });

  return (
    <div className="min-h-dvh pb-[env(safe-area-inset-bottom)]">
      <MediKioskHeader />

      <main id="main-content" tabIndex={-1}>
        <HeroExperience onStart={start} />
        <HowItWorks />
        <SpeakSection />
        <BuiltForIndia />
        <AyushSection />
        <WordsToStructure />
        <DocumentsSection />
        <ClinicianHandoff />
        <TrustSection />
        <EcosystemSection />
        <AccessibilitySection />
        <AudienceSection />
        <SystemWorkflow />
        <BuiltWithCare />
        <FinalCta onStart={start} />
        <HelpCard onOpen={() => setHelpOpen(true)} />
      </main>

      <SiteFooter onHelp={() => setHelpOpen(true)} />

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
