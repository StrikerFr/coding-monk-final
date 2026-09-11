import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PatientProvider } from "@/features/patient/patient-context";
import { PatientShell } from "@/features/patient/components/PatientShell";
import { RequireAuth } from "@/features/auth/RequireAuth";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "My Health - MediKiosk" },
      {
        name: "description",
        content:
          "A calm personal health home for viewing recent consultations, records, documents, and consent choices.",
      },
      { property: "og:title", content: "My Health - MediKiosk" },
      {
        property: "og:description",
        content: "Your health journey, records, and documents in one calm personal space.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <PatientProvider>
        <PatientShell>
          <Outlet />
        </PatientShell>
      </PatientProvider>
    </RequireAuth>
  ),
});
