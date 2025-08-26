"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function CredentialsSignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) setError(res.error);
    else window.location.href = "/";
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded">
          {error}
        </p>
      )}
      <div className="space-y-1">
        <label className="text-xs font-medium tracking-wide text-[var(--color-blue)]/80">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md bg-[var(--color-beige)]/35 border border-[var(--color-blue)]/15 focus:border-[var(--color-blue)] focus:ring-2 focus:ring-[var(--color-blue)]/25 px-3 py-2 text-sm placeholder-gray-500 outline-none transition"
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium tracking-wide text-[var(--color-blue)]/80">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md bg-[var(--color-beige)]/35 border border-[var(--color-blue)]/15 focus:border-[var(--color-blue)] focus:ring-2 focus:ring-[var(--color-blue)]/25 px-3 py-2 text-sm placeholder-gray-500 outline-none transition"
          placeholder="Choose a secure password"
        />
      </div>
      <button className="w-full relative overflow-hidden rounded-md bg-[var(--color-blue)] text-[var(--color-beige)] font-semibold text-sm py-2 shadow hover:bg-[#042c49] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/40 transition">
        <span className="relative z-10">Create account</span>
      </button>
    </form>
  );
}
