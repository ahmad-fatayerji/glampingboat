"use client";
import { useState }          from "react";
import { useRouter, useParams } from "next/navigation";

export default function ResetPasswordPage() {
  const { token } = useParams() as { token: string };
  const [pw, setPw]           = useState("");
  const [msg, setMsg]         = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const router                 = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: pw }),
    });

    if (res.ok) {
      setMsg("Password reset! Redirecting to login...");
      setTimeout(() => router.push("/testing"), 1500);
    } else {
      const { error } = await res.json();
      setError(error || "Something went wrong.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl mb-4">Reset Password</h1>
      {msg   && <div className="mb-4 p-2 bg-green-100 rounded">{msg}</div>}
      {error && <div className="mb-4 p-2 bg-red-100 rounded">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <input
          type="password"
          placeholder="New password"
          className="w-full border p-2 rounded"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded">
          Reset Password
        </button>
      </form>
    </div>
  );
}
