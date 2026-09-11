import { createFileRoute } from "@tanstack/react-router";
import { PatientSectionPage } from "@/features/patient/components/pages/PatientSectionPage";
export const Route = createFileRoute("/patient/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline - MediKiosk My Health" },
      {
        name: "description",
        content: "View your timeline in the MediKiosk personal health space.",
      },
      { property: "og:title", content: "Timeline - MediKiosk My Health" },
      {
        property: "og:description",
        content: "Your personal health timeline, kept clear and accessible.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PatientSectionPage section="timeline" />,
});
