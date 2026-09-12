import { createFileRoute } from "@tanstack/react-router";
import { ReviewAttestPage } from "@/features/clinician/components/pages/ReviewAttestPage";

export const Route = createFileRoute("/clinician/patients/$id/sign")({
  head: () => ({
    meta: [
      { title: "Review and Attest - MediKiosk" },
      {
        name: "description",
        content: "Clinician review and attestation step for a prepared case.",
      },
      { property: "og:title", content: "Review and Attest - MediKiosk" },
      {
        property: "og:description",
        content: "Clinician review and attestation step for a prepared case.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ReviewAttestPage,
});
