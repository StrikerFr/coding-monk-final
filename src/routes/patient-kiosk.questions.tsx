import { createFileRoute } from "@tanstack/react-router";
import { QuestionsPage } from "@/features/patient-kiosk/components/pages/QuestionsPage";

export const Route = createFileRoute("/patient-kiosk/questions")({
  head: () => ({
    meta: [
      { title: "Your questions - MediKiosk" },
      {
        name: "description",
        content: "Answer a few check-in questions by speaking, in Hindi or English.",
      },
      { property: "og:title", content: "Your questions - MediKiosk" },
      {
        property: "og:description",
        content: "Answer a few check-in questions by speaking, in Hindi or English.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: QuestionsPage,
});
