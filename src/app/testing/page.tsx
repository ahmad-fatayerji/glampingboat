// src/app/testing/page.tsx
import { auth } from "@auth"                            // your NextAuth factory
import CredentialsSignUp from "@/components/CredentialsSignUp"
import CredentialsSignIn from "@/components/CredentialsSignIn"
import GoogleSignInButton from "@/components/GoogleSignInButton"
import LogoutButton from "@/components/LogoutButton"

export default async function TestingPage() {
  // run on the server
  const session = await auth()

  return (
    <div className="max-w-md mx-auto mt-12 bg-white shadow-lg rounded-lg overflow-hidden">
      {/* header */}
      <div className="bg-blue-600 p-4">
        <h1 className="text-white text-center text-xl font-semibold">
          GlampingBoat UserSystem
        </h1>
      </div>

      {/* body */}
      <div className="p-6 space-y-6">
        {session ? (
          <div className="bg-green-100 p-4 rounded-lg flex justify-between items-center">
            <span className="text-green-800 font-medium">
              Welcome, <strong>{session.user?.email || "User"}</strong>
            </span>
            <LogoutButton />
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded-lg text-gray-700 text-center">
            Browsing as <strong>guest</strong>
          </div>
        )}

        {/* Credentials section */}
        <div className="border-t border-gray-300 pt-4 text-center text-gray-500 uppercase tracking-wide">
          Credentials
        </div>
        <div className="space-y-4">
          <CredentialsSignUp />
          <CredentialsSignIn />
        </div>

        {/* OAuth section */}
        <div className="border-t border-gray-300 pt-4 text-center text-gray-500 uppercase tracking-wide">
          Or continue with
        </div>
        <GoogleSignInButton />
      </div>
    </div>
  )
}
