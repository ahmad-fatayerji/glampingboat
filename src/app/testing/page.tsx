// src/app/testing/page.tsx
import Link from "next/link"
import { auth } from "@auth"                     // your NextAuth factory
import CredentialsSignUp from "@/components/CredentialsSignUp"
import CredentialsSignIn from "@/components/CredentialsSignIn"
import GoogleSignInButton from "@/components/GoogleSignInButton"

export default async function TestingPage() {
  // purely server‑side
  const session = await auth()

  return (
    <div className="p-8 space-y-8">
      {session ? (
        <div className="bg-green-100 p-4 rounded">
          <p>Welcome, {session.user?.email || "Guest"}</p>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded"
            >
              Logout
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-gray-100 p-4 rounded">
          Browsing as guest
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Credentials</h2>

        {/* Sign‑up & Sign‑in forms */}
        <CredentialsSignUp />
        <CredentialsSignIn />

        {/* Forgot password link */}
        <div className="pt-2">
          <Link href="/forgot-password">
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </Link>
        </div>
      </div>

      <hr />

      <GoogleSignInButton />
    </div>
  )
}
