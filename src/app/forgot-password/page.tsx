"use client"

import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      setMessage("If that account exists, you’ll get an email with reset instructions.")
    } else {
      const { error: err } = await res.json().catch(() => ({ error: "Bad request." }))
      setError(err || "Something went wrong.")
    }
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl mb-4">Forgot your password?</h1>
      {message && <div className="mb-4 p-2 bg-green-100 rounded">{message}</div>}
      {error   && <div className="mb-4 p-2 bg-red-100 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          Email
          <input
            type="email"
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Send reset link
        </button>
      </form>
    </div>
  )
}
