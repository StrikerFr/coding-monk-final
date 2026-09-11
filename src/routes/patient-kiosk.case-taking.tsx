import { createFileRoute } from "@tanstack/react-router";
import { CaseTakingPage } from "@/features/patient-kiosk/components/pages/CaseTakingPage";

export const Route = createFileRoute("/patient-kiosk/case-taking")({
  head: () => ({
    meta: [
      { title: "Check-in - MediKiosk" },
      { name: "description", content: "Part of the MediKiosk patient check-in: case taking." },
      { property: "og:title", content: "Check-in - MediKiosk" },
      {
        property: "og:description",
        content: "Part of the MediKiosk patient check-in: case taking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CaseTakingPage,
});
