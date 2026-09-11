import { createFileRoute } from "@tanstack/react-router";
import { WelcomePage } from "@/features/patient-kiosk/components/pages/WelcomePage";

export const Route = createFileRoute("/patient-kiosk/")({
  head: () => ({
    meta: [
      { title: "Patient Check-in - MediKiosk" },
      {
        name: "description",
        content:
          "Begin your MediKiosk check-in. A few simple questions in Hindi or English before your consultation — you can answer by speaking.",
      },
      { property: "og:title", content: "Patient Check-in - MediKiosk" },
      {
        property: "og:description",
        content: "A calm, guided check-in before your consultation, in Hindi or English.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WelcomePage,
});
