import { createFileRoute } from "@tanstack/react-router";
import { ConsentPage } from "@/features/patient-kiosk/components/pages/ConsentPage";

export const Route = createFileRoute("/patient-kiosk/consent")({
  head: () => ({
    meta: [
      { title: "Check-in - MediKiosk" },
      { name: "description", content: "Part of the MediKiosk patient check-in: consent." },
      { property: "og:title", content: "Check-in - MediKiosk" },
      { property: "og:description", content: "Part of the MediKiosk patient check-in: consent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConsentPage,
});
