// src/app/testing/page.tsx
"use client"

import { useState } from "react"
import { useSession, signIn, signOut } from "next-auth/react"

export default function TestingPage() {
  const { data: session, status } = useSession()
  const [mode, setMode] = useState<"signin"|"signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string|null>(null)

  if (status === "loading") {
    return <p>Loading session…</p>
  }

  // Logged‐in view
  if (session?.user) {
    return (
      <div className="p-8 space-y-4">
        <p className="text-green-600">Welcome, {session.user.email}!</p>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Logout
        </button>
      </div>
    )
  }

  // Unauthenticated view: sign‑in / sign‑up form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // next-auth credential flow will auto‐signup on first use
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (res?.error) {
      setError("Credentials incorrect")
    } else {
      setError(null)
    }
  }

  return (
    <div className="max-w-sm mx-auto p-8 bg-gray-800 text-white rounded space-y-6">
      <h1 className="text-2xl font-bold">
        {mode === "signin" ? "Sign In" : "Sign Up"}
      </h1>

      {error && (
        <div className="bg-red-600 p-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-1 p-2 bg-gray-700 rounded"
          />
        </label>
        <label className="block">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mt-1 p-2 bg-gray-700 rounded"
          />
        </label>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-blue-400 hover:underline"
        >
          {mode === "signin"
            ? "Need an account? Sign Up"
            : "Already have one? Sign In"}
        </button>
      </div>

      <hr className="border-gray-600" />

      <button
        onClick={() => signIn("google")}
        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center space-x-2"
      >
        <span>Sign in with Google</span>
      </button>
    </div>
  )
}
