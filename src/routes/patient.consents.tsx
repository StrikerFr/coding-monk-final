import { createFileRoute } from "@tanstack/react-router";
import { PatientSectionPage } from "@/features/patient/components/pages/PatientSectionPage";
export const Route = createFileRoute("/patient/consents")({
  head: () => ({
    meta: [
      { title: "Consents - MediKiosk My Health" },
      {
        name: "description",
        content: "View your consents in the MediKiosk personal health space.",
      },
      { property: "og:title", content: "Consents - MediKiosk My Health" },
      {
        property: "og:description",
        content: "Your personal health consents, kept clear and accessible.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PatientSectionPage section="consents" />,
});
