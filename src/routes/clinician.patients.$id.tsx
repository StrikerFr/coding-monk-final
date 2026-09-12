import { createFileRoute } from "@tanstack/react-router";
import { PatientCasePage } from "@/features/clinician/components/pages/PatientCasePage";

export const Route = createFileRoute("/clinician/patients/$id")({
  head: () => ({
    meta: [
      { title: "Patient Case - MediKiosk" },
      {
        name: "description",
        content: "Confirmed information, source evidence and assisted draft for one case.",
      },
      { property: "og:title", content: "Patient Case - MediKiosk" },
      {
        property: "og:description",
        content: "Confirmed information, source evidence and assisted draft for one case.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CaseRoute,
});

function CaseRoute() {
  const { id } = Route.useParams();
  return <PatientCasePage patientId={id} />;
}
