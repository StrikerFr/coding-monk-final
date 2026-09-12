import { createFileRoute, Link } from "@tanstack/react-router";
import { SignIn } from "@clerk/tanstack-react-start";
import { SIGN_UP_PATH } from "@/features/auth/config";

type SignInSearch = { redirect?: string };

export const Route = createFileRoute("/sign-in")({
  validateSearch: (search: Record<string, unknown>): SignInSearch => {
    const value = search["redirect"];
    return typeof value === "string" && value.startsWith("/") ? { redirect: value } : {};
  },
  head: () => ({
    meta: [
      { title: "Sign in - MediKiosk" },
      {
        name: "description",
        content:
          "Sign in to your MediKiosk account to reach your health records or staff workspace.",
      },
      { property: "og:title", content: "Sign in - MediKiosk" },
      {
        property: "og:description",
        content: "Sign in to MediKiosk to reach your health records or staff workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const { redirect } = Route.useSearch();

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="flex w-full max-w-md flex-col items-center">
        <img src="/logo.png" alt="MediKiosk" className="h-12 w-auto" />
        <h1 className="mt-6 text-center text-2xl font-semibold">
          <span className="deva block">MediKiosk में साइन इन करें</span>
          <span className="mt-1 block text-base font-medium text-muted-foreground">
            Sign in to MediKiosk
          </span>
        </h1>
        <div className="mt-8 w-full">
          <SignIn
            routing="hash"
            signUpUrl={SIGN_UP_PATH}
            forceRedirectUrl={redirect ?? "/patient"}
          />
        </div>
        <Link
          to="/"
          className="mt-8 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <span className="deva">वापस जाएं</span>
          <span aria-hidden="true" className="px-1.5 opacity-50">
            /
          </span>
          <span>Back to home</span>
        </Link>
      </div>
    </main>
  );
}
