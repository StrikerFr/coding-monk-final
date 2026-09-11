import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ClinicianProvider } from "@/features/clinician/clinician-context";
import { ClinicianShell } from "@/features/clinician/components/ClinicianShell";
import { RequireAuth } from "@/features/auth/RequireAuth";

export const Route = createFileRoute("/clinician")({
  head: () => ({
    meta: [
      { title: "Clinical Workspace - MediKiosk" },
      {
        name: "description",
        content:
          "MediKiosk clinical workspace: review kiosk-prepared patient cases, confirmed facts, evidence and assisted drafts.",
      },
      { property: "og:title", content: "Clinical Workspace - MediKiosk" },
      {
        property: "og:description",
        content: "Review kiosk-prepared patient cases before the consultation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClinicianLayout,
});

function ClinicianLayout() {
  return (
    <RequireAuth>
      <ClinicianProvider>
        <ClinicianShell>
          <Outlet />
        </ClinicianShell>
      </ClinicianProvider>
    </RequireAuth>
  );
}
