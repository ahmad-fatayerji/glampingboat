import { auth } from "@/../auth";
import CredentialsTabs from "../../components/auth/CredentialsTabs";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import LogoutButton from "@/components/auth/LogoutButton";
import Link from "next/link";

export default async function AccountPage() {
  const session = await auth();
  return (
    <div className="min-h-screen bg-[var(--color-white)] flex items-center justify-center px-4 pt-40 pb-12">
      {session ? <SignedIn email={session.user?.email || ""} /> : <AuthForms />}
    </div>
  );
}

function SignedIn({ email }: { email: string }) {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg border border-[var(--color-blue)]/10 space-y-6 text-[var(--color-blue)]">
      <h1 className="text-center text-2xl font-semibold tracking-wide text-[var(--color-blue)]">
        Your Account
      </h1>
      <div className="text-sm flex items-center justify-between bg-[var(--color-beige)]/60 px-4 py-3 rounded-md">
        <span className="truncate font-medium">{email}</span>
        <LogoutButton />
      </div>
      <p className="text-xs text-[var(--color-blue)]/70 text-center">
        Bookings dashboard coming soon.
      </p>
    </div>
  );
}

function AuthForms() {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg border border-[var(--color-blue)]/10 space-y-8 text-[var(--color-blue)]">
      <CredentialsTabs />
      <div className="relative flex items-center gap-4 text-[10px] uppercase tracking-wider text-[var(--color-blue)]/50">
        <span className="flex-1 h-px bg-[var(--color-blue)]/15" />
        <span>or</span>
        <span className="flex-1 h-px bg-[var(--color-blue)]/15" />
      </div>
      <GoogleSignInButton />
      <div className="text-right -mt-4">
        <Link
          href="/forgot-password"
          className="text-xs text-[var(--color-blue)]/60 hover:text-[var(--color-blue)] underline underline-offset-2"
        >
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
