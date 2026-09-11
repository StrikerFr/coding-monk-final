import { useEffect, useRef, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@clerk/tanstack-react-start";
import { SIGN_IN_PATH } from "./config";

/**
 * Client-side gate for the signed-in MediKiosk surfaces.
 * Unauthenticated visitors are sent to the sign-in page and returned afterwards.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const redirected = useRef(false);

  useEffect(() => {
    if (!isLoaded || isSignedIn || redirected.current) return;
    redirected.current = true;
    navigate({ to: SIGN_IN_PATH, search: { redirect: pathname }, replace: true });
  }, [isLoaded, isSignedIn, navigate, pathname]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        <p className="text-base text-muted-foreground" role="status">
          <span className="deva block text-foreground">कृपया प्रतीक्षा करें…</span>
          <span className="mt-1 block">Checking your sign-in…</span>
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
