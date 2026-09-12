import { Link } from "@tanstack/react-router";
import { useAuth, UserButton } from "@clerk/tanstack-react-start";
import { cn } from "@/lib/utils";
import { SIGN_IN_PATH } from "./config";

/** Sign-in affordance that always reflects the current session. */
export function AuthStatus({ className }: { className?: string }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div className={cn("h-11 w-24", className)} aria-hidden="true" />;
  }

  return (
    <div className={cn("flex items-center", className)}>
      {isSignedIn ? (
        <UserButton appearance={{ elements: { userButtonAvatarBox: "size-9" } }} />
      ) : (
        <Link
          to={SIGN_IN_PATH}
          className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-5 text-sm font-semibold transition-colors hover:bg-muted"
        >
          <span className="deva">साइन इन</span>
          <span aria-hidden="true" className="px-1.5 opacity-50">
            /
          </span>
          <span>Sign in</span>
        </Link>
      )}
    </div>
  );
}
