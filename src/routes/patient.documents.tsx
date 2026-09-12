import { createFileRoute } from "@tanstack/react-router";
import { PatientSectionPage } from "@/features/patient/components/pages/PatientSectionPage";
export const Route = createFileRoute("/patient/documents")({
  head: () => ({
    meta: [
      { title: "Documents - MediKiosk My Health" },
      {
        name: "description",
        content: "View your documents in the MediKiosk personal health space.",
      },
      { property: "og:title", content: "Documents - MediKiosk My Health" },
      {
        property: "og:description",
        content: "Your personal health documents, kept clear and accessible.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PatientSectionPage section="documents" />,
});
