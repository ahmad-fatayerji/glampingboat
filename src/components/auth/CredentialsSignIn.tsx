"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useT } from "@/components/Language/useT";

type LoginStartResponse = {
  error?: string;
  requiresMfa?: boolean;
  challengeToken?: string;
};

export default function CredentialsSignIn() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const finishSignIn = async (token?: string, oneTimeCode?: string) => {
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      challengeToken: token ?? "",
      code: oneTimeCode ?? "",
    });

    if (result?.error) {
      setError(
        token
          ? "The code is invalid or expired."
          : result.error
      );
      return;
    }
    window.location.href = "/account?signedIn=1";
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setEmailNotVerified(false);
    setSubmitting(true);

    try {
      if (challengeToken) {
        await finishSignIn(challengeToken, code);
        return;
      }

      const response = await fetch("/api/auth/login/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json().catch(() => ({}))) as LoginStartResponse;

      if (!response.ok) {
        if (result.error === "EMAIL_NOT_VERIFIED") {
          setEmailNotVerified(true);
          setError("Verify your email before signing in.");
        } else {
          setError(result.error ?? t("genericError"));
        }
        return;
      }

      if (result.requiresMfa && result.challengeToken) {
        setChallengeToken(result.challengeToken);
        setMessage("We sent an 8-digit sign-in code to your email.");
        return;
      }

      await finishSignIn();
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  const resendVerification = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(result.error ?? t("genericError"));
        return;
      }
      setMessage("If the account exists, a new verification link was sent.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <p className="rounded-md border border-[#8a3a30] bg-[#8a3a30]/25 px-3 py-2 text-sm text-[#ffd9d9]">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-md border border-[#65845f] bg-[#3f6546]/35 px-3 py-2 text-sm text-[#e8f4df]">
          {message}
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm text-[var(--color-beige)]/90">
        <span>{t("email")}</span>
        <input
          type="email"
          required
          disabled={Boolean(challengeToken)}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-10 w-full rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] px-3 text-sm text-[var(--color-blue)] outline-none focus:border-[#234d69] disabled:opacity-60"
          placeholder={t("authEmailPlaceholder")}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-[var(--color-beige)]/90">
        <span>{t("password")}</span>
        <input
          type="password"
          required
          disabled={Boolean(challengeToken)}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-10 w-full rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] px-3 text-sm text-[var(--color-blue)] outline-none focus:border-[#234d69] disabled:opacity-60"
          placeholder={t("authPasswordPlaceholder")}
        />
      </label>
      {challengeToken && (
        <label className="flex flex-col gap-1 text-sm text-[var(--color-beige)]/90">
          <span>Email sign-in code</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{8}"
            maxLength={8}
            required
            autoFocus
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            className="h-10 w-full rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] px-3 text-center text-lg tracking-[0.3em] text-[var(--color-blue)] outline-none focus:border-[#234d69]"
          />
        </label>
      )}
      {emailNotVerified && (
        <button
          type="button"
          onClick={resendVerification}
          disabled={submitting}
          className="w-full text-sm underline underline-offset-2"
        >
          Send a new verification link
        </button>
      )}
      {challengeToken && (
        <button
          type="button"
          onClick={() => {
            setChallengeToken(null);
            setCode("");
            setMessage(null);
          }}
          className="w-full text-xs underline underline-offset-2"
        >
          Use a different account
        </button>
      )}
      <button
        type="submit"
        disabled={submitting || (Boolean(challengeToken) && code.length !== 8)}
        className="w-full rounded-xl bg-[#0d3350] py-2 text-sm tracking-wide text-[var(--color-beige)] transition hover:bg-[#123f61] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {challengeToken ? "Verify and sign in" : t("authSignIn")}
      </button>
    </form>
  );
}
