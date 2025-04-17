// src/components/CredentialsSignIn.tsx
"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function CredentialsSignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (res?.error) {
      setError(res.error)
    } else {
      // success → go to home
      window.location.href = "/"
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-80 mx-auto">
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <label className="block">Email</label>
        <input
          type="email"
          className="border w-full p-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block">Password</label>
        <input
          type="password"
          className="border w-full p-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded"
      >
        Sign up / Sign in
      </button>
    </form>
  )
}
