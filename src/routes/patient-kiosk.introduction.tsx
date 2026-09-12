import { createFileRoute } from "@tanstack/react-router";
import { IntroductionPage } from "@/features/patient-kiosk/components/pages/IntroductionPage";

export const Route = createFileRoute("/patient-kiosk/introduction")({
  head: () => ({
    meta: [
      { title: "Check-in - MediKiosk" },
      { name: "description", content: "Part of the MediKiosk patient check-in: introduction." },
      { property: "og:title", content: "Check-in - MediKiosk" },
      {
        property: "og:description",
        content: "Part of the MediKiosk patient check-in: introduction.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: IntroductionPage,
});
