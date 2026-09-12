import { createFileRoute } from "@tanstack/react-router";
import { ProcessingPage } from "@/features/patient-kiosk/components/pages/ProcessingPage";

export const Route = createFileRoute("/patient-kiosk/processing")({
  head: () => ({
    meta: [
      { title: "Check-in - MediKiosk" },
      { name: "description", content: "Part of the MediKiosk patient check-in: processing." },
      { property: "og:title", content: "Check-in - MediKiosk" },
      {
        property: "og:description",
        content: "Part of the MediKiosk patient check-in: processing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProcessingPage,
});
