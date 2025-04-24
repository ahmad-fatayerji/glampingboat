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
      isSignup: "true",
    });

    if (res?.error) setError(res.error);
    else window.location.href = "/";
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {error && <p className="text-red-600">{error}</p>}
      <div>
        <label>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2"
        />
      </div>
      <div>
        <label>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2"
        />
      </div>
      <button className="w-full bg-blue-600 text-white p-2">Sign Up</button>
    </form>
  );
}
