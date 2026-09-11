import { createFileRoute } from "@tanstack/react-router";
import { VitalsPage } from "@/features/patient-kiosk/components/pages/VitalsPage";

export const Route = createFileRoute("/patient-kiosk/vitals")({
  head: () => ({
    meta: [
      { title: "Check-in - MediKiosk" },
      { name: "description", content: "Part of the MediKiosk patient check-in: vitals." },
      { property: "og:title", content: "Check-in - MediKiosk" },
      { property: "og:description", content: "Part of the MediKiosk patient check-in: vitals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VitalsPage,
});
