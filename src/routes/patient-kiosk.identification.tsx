import { createFileRoute } from "@tanstack/react-router";
import { IdentificationPage } from "@/features/patient-kiosk/components/pages/IdentificationPage";

export const Route = createFileRoute("/patient-kiosk/identification")({
  head: () => ({
    meta: [
      { title: "Check-in - MediKiosk" },
      { name: "description", content: "Part of the MediKiosk patient check-in: identification." },
      { property: "og:title", content: "Check-in - MediKiosk" },
      {
        property: "og:description",
        content: "Part of the MediKiosk patient check-in: identification.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: IdentificationPage,
});
