"use client";
import { useState } from "react";
import { useT } from "@/components/Language/useT";
import { useLanguage } from "@/components/Language/LanguageContext";
import { validatePasswordPolicy } from "@/lib/password-policy";
import PasswordRequirements from "@/components/auth/PasswordRequirements";

export default function CredentialsSignUp() {
  const t = useT();
  const { locale } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const passwordPolicy = validatePasswordPolicy(password);
  const passwordsMatch = password === confirmPassword;
  const canSubmit =
    !submitting && passwordPolicy.valid && passwordsMatch && Boolean(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!passwordPolicy.valid) {
      setError(t("passwordPolicyError"));
      return;
    }

    if (!passwordsMatch) {
      setError(t("passwordMismatch"));
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, locale }),
      });

      const result = (await res.json().catch(() => ({}))) as {
        error?: string;
        existingPendingAccount?: boolean;
      };
      if (!res.ok) {
        setError(result.error ?? t("genericError"));
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setMessage(
        result.existingPendingAccount
          ? t("authSignupPendingVerification")
          : t("authSignupVerificationSent")
      );
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
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
      <div className="flex flex-col gap-1">
        <label className="text-sm text-[var(--color-beige)]/90">
          {t("email")}
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] px-3 text-sm text-[var(--color-blue)] outline-none transition placeholder:text-[var(--color-blue)]/45 focus:border-[#234d69]"
          placeholder={t("authEmailPlaceholder")}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-[var(--color-beige)]/90">
          {t("password")}
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 w-full rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] px-3 text-sm text-[var(--color-blue)] outline-none transition placeholder:text-[var(--color-blue)]/45 focus:border-[#234d69]"
          placeholder={t("authChoosePasswordPlaceholder")}
        />
      </div>
      <PasswordRequirements password={password} />
      <div className="flex flex-col gap-1">
        <label className="text-sm text-[var(--color-beige)]/90">
          {t("confirmPassword")}
        </label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-10 w-full rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] px-3 text-sm text-[var(--color-blue)] outline-none transition placeholder:text-[var(--color-blue)]/45 focus:border-[#234d69]"
          placeholder={t("confirmPassword")}
        />
        {confirmPassword && !passwordsMatch && (
          <p className="text-xs text-[#ffd9d9]">{t("passwordMismatch")}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-xl bg-[#0d3350] py-2 text-sm tracking-wide text-[var(--color-beige)] transition hover:bg-[#123f61] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {t("authCreateAccount")}
      </button>
    </form>
  );
}
