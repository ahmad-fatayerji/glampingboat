"use client"

import { signIn } from "next-auth/react"

export default function SignIn() {
  return (
    <button
      onClick={() => signIn("google")}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Sign in with Google
    </button>
  )
}
