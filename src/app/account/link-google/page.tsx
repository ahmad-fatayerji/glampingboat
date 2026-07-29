"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type LinkDetails = {
  email: string;
  googleEmail: string;
  requiresPassword: boolean;
};

export default function LinkGooglePage() {
  const token = useSearchParams().get("token") ?? "";
  const [details, setDetails] = useState<LinkDetails | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    fetch(`/api/auth/link-google?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        setDetails(result);
      })
      .catch((reason) => setError(reason.message ?? "Invalid link request"));
  }, [token]);

  const confirm = async () => {
    setWorking(true);
    setError("");
    const response = await fetch("/api/auth/link-google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error ?? "Unable to link Google");
      setWorking(false);
      return;
    }
    await signIn("google", { callbackUrl: "/account?signedIn=1" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-40 pb-12">
      <div className="w-full max-w-md space-y-5 border border-white/15 bg-[#3f5666]/92 p-8 text-[var(--color-beige)]">
        <h1 className="text-center text-2xl">Link your Google account</h1>
        {details && (
          <p className="text-sm leading-6">
            The Google address <strong>{details.googleEmail}</strong> belongs to
            the same mailbox as <strong>{details.email}</strong>. Confirm that
            you want both sign-in methods to open the same account.
          </p>
        )}
        {details?.requiresPassword && (
          <label className="flex flex-col gap-1 text-sm">
            <span>Current password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-10 rounded-md bg-[var(--color-beige)] px-3 text-[var(--color-blue)]"
            />
          </label>
        )}
        {error && <p className="text-sm text-[#ffd9d9]">{error}</p>}
        <button
          type="button"
          disabled={!details || working || (details.requiresPassword && !password)}
          onClick={confirm}
          className="w-full rounded-xl bg-[#0d3350] py-2 disabled:opacity-60"
        >
          {working ? "Linking..." : "Link Google and continue"}
        </button>
      </div>
    </div>
  );
}
