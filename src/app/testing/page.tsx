import { auth } from "@auth"; // NextAuth server fn
import Link from "next/link";
import CredentialsPanel from "@/components/auth/CredentialsPanel";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function TestingPage() {
  // Deprecated page: redirecting users to /account in future cleanup.
  const session = await auth(); // purely server‑side

  return (
    <div className="max-w-md mx-auto mt-12 bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 p-4 text-center">
        <h1 className="text-white text-xl font-semibold">
          GlampingBoat LoginSystem
        </h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Auth status */}
        {session ? (
          <div className="bg-green-100 p-4 rounded flex items-center justify-between">
            <span>
              Welcome, <strong>{session.user?.email}</strong>
            </span>
            <LogoutButton />
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded text-center">
            Browsing as guest
          </div>
        )}

        {/* Credentials: now a single toggle panel */}
        <div>
          <h2 className="text-center text-sm uppercase text-gray-500 mb-4">
            Credentials
          </h2>
          <CredentialsPanel />

          {/* Forgot password link */}
          <div className="text-right mt-2">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Google OAuth */}
        <GoogleSignInButton />
      </div>
    </div>
  );
}
