import { createFileRoute } from "@tanstack/react-router";
import { PatientHomePage } from "@/features/patient/components/pages/PatientHomePage";
export const Route = createFileRoute("/patient/")({
  head: () => ({
    meta: [
      { title: "My Health Home - MediKiosk" },
      {
        name: "description",
        content: "See your latest consultation, recent records, documents, and health journey.",
      },
      { property: "og:title", content: "My Health Home - MediKiosk" },
      {
        property: "og:description",
        content: "Your recent health information, organized and easy to access.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PatientHomePage,
});
