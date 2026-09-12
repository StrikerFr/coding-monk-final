import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AssistedShell } from "@/features/assisted-kiosk/components/AssistedShell";
import { AssistedKioskProvider } from "@/features/assisted-kiosk/assisted-kiosk-context";
import { RequireAuth } from "@/features/auth/RequireAuth";
export const Route = createFileRoute("/assisted-kiosk")({
  head: () => ({
    meta: [
      { title: "Assisted Care Workspace - MediKiosk" },
      {
        name: "description",
        content: "MediKiosk frontend demonstration for staff-assisted patient intake.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AssistedKioskLayout,
});
function AssistedKioskLayout() {
  return (
    <RequireAuth>
      <AssistedKioskProvider>
        <AssistedShell>
          <Outlet />
        </AssistedShell>
      </AssistedKioskProvider>
    </RequireAuth>
  );
}
