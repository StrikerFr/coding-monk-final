import { createFileRoute } from "@tanstack/react-router";
import { PatientSectionPage } from "@/features/patient/components/pages/PatientSectionPage";
export const Route = createFileRoute("/patient/intakes")({
  head: () => ({
    meta: [
      { title: "Intakes - MediKiosk My Health" },
      { name: "description", content: "View your intakes in the MediKiosk personal health space." },
      { property: "og:title", content: "Intakes - MediKiosk My Health" },
      {
        property: "og:description",
        content: "Your personal health intakes, kept clear and accessible.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PatientSectionPage section="intakes" />,
});
