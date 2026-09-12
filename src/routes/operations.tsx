import { createFileRoute, Outlet } from "@tanstack/react-router";
import { OperationsShell } from "@/features/operations/components/OperationsShell";
import { OperationsProvider } from "@/features/operations/operations-context";
import { RequireAuth } from "@/features/auth/RequireAuth";
export const Route = createFileRoute("/operations")({
  head: () => ({
    meta: [
      { title: "Operations Console - MediKiosk" },
      { name: "description", content: "MediKiosk synthetic operations control room." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OperationsLayout,
});
function OperationsLayout() {
  return (
    <RequireAuth>
      <OperationsProvider>
        <OperationsShell>
          <Outlet />
        </OperationsShell>
      </OperationsProvider>
    </RequireAuth>
  );
}
