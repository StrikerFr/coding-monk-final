import { createFileRoute } from "@tanstack/react-router";
import { CompletePage } from "@/features/patient-kiosk/components/pages/CompletePage";

export const Route = createFileRoute("/patient-kiosk/complete")({
  head: () => ({
    meta: [
      { title: "Check-in - MediKiosk" },
      { name: "description", content: "Part of the MediKiosk patient check-in: complete." },
      { property: "og:title", content: "Check-in - MediKiosk" },
      { property: "og:description", content: "Part of the MediKiosk patient check-in: complete." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CompletePage,
});
