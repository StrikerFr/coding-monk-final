import { createFileRoute, Link } from "@tanstack/react-router";
import { SignUp } from "@clerk/tanstack-react-start";
import { SIGN_IN_PATH } from "@/features/auth/config";

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [
      { title: "Create account - MediKiosk" },
      {
        name: "description",
        content:
          "Create a MediKiosk account to keep your visit records and documents in one place.",
      },
      { property: "og:title", content: "Create account - MediKiosk" },
      {
        property: "og:description",
        content: "Create a MediKiosk account to keep your visit records in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="flex w-full max-w-md flex-col items-center">
        <img src="/logo.png" alt="MediKiosk" className="h-12 w-auto" />
        <h1 className="mt-6 text-center text-2xl font-semibold">
          <span className="deva block">नया खाता बनाएं</span>
          <span className="mt-1 block text-base font-medium text-muted-foreground">
            Create your MediKiosk account
          </span>
        </h1>
        <div className="mt-8 w-full">
          <SignUp routing="hash" signInUrl={SIGN_IN_PATH} forceRedirectUrl="/patient" />
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
