import { createFileRoute } from "@tanstack/react-router";
import { ConversationPage } from "@/features/patient-kiosk/components/pages/ConversationPage";

export const Route = createFileRoute("/patient-kiosk/conversation")({
  head: () => ({
    meta: [
      { title: "Talk to check in - MediKiosk" },
      {
        name: "description",
        content: "Check in by simply talking: the assistant asks, you answer in Hindi or English.",
      },
      { property: "og:title", content: "Talk to check in - MediKiosk" },
      {
        property: "og:description",
        content: "Check in by simply talking: the assistant asks, you answer in Hindi or English.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ConversationPage,
});
