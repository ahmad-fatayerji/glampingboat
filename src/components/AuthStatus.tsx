// src/components/AuthStatus.tsx
"use client"
import { useSession, signOut } from "next-auth/react"

export default function AuthStatus() {
  const { data: session, status } = useSession()

  if (status === "loading") return <p>Loading…</p>
  if (session?.user) {
    return (
      <div className="p-4 bg-green-100 rounded">
        Welcome, {session.user.email}{" "}
        <button
          onClick={() => signOut()}
          className="ml-4 text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>
    )
  }
  return <div className="p-4 bg-gray-100 rounded">Browsing as guest</div>
}
