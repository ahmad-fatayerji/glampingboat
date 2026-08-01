"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useT } from "@/components/Language/useT";
import { validatePasswordPolicy } from "@/lib/password-policy";
import PasswordRequirements from "@/components/auth/PasswordRequirements";

export default function ResetPasswordPage() {
  const t = useT();
  const { token } = useParams() as { token: string };
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordPolicy = validatePasswordPolicy(pw);
  const passwordsMatch = pw === confirmPw;
  const canSubmit =
    passwordPolicy.valid && passwordsMatch && Boolean(pw) && !isSubmitting;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);

    if (!passwordPolicy.valid) {
      setError(t("passwordPolicyError"));
      return;
    }

    if (!passwordsMatch) {
      setError(t("passwordMismatch"));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: pw }),
      });

      if (res.ok) {
        setMsg(t("passwordResetSuccess"));
        setTimeout(() => router.push("/account"), 1500);
        return;
      }

      const { error: err } = await res
        .json()
        .catch(() => ({ error: t("genericError") }));
      setError(err || t("genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "h-10 w-full rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] px-3 text-sm text-[var(--color-blue)] outline-none transition placeholder:text-[var(--color-blue)]/45 focus:border-[#234d69]";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-40 pb-12">
      <div className="w-full max-w-md border border-white/15 bg-[#3f5666]/92 p-8 text-[var(--color-beige)] shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <h1 className="border-b border-[#173c59] pb-2 text-center text-[1.3rem] tracking-wide text-[var(--color-beige)]">
          {t("resetPassword")}
        </h1>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {msg && (
            <p className="rounded-md border border-[#65845f] bg-[#3f6546]/35 px-3 py-2 text-sm text-[#e8f4df]">
              {msg}
            </p>
          )}
          {error && (
            <p className="rounded-md border border-[#8a3a30] bg-[#8a3a30]/25 px-3 py-2 text-sm text-[#ffd9d9]">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm text-[var(--color-beige)]/90">
              {t("newPassword")}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder={t("newPassword")}
              className={inputClass}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
            />
          </div>

          <PasswordRequirements password={pw} tone="dark" />

          <div className="flex flex-col gap-1">
            <label className="text-sm text-[var(--color-beige)]/90">
              {t("confirmPassword")}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder={t("confirmPassword")}
              className={inputClass}
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
            />
            {confirmPw && !passwordsMatch && (
              <p className="text-xs text-[#ffd9d9]">{t("passwordMismatch")}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-[#0d3350] py-2 text-sm tracking-wide text-[var(--color-beige)] transition hover:bg-[#123f61] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t("sending") : t("resetPassword")}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link
            href="/account"
            className="text-xs text-[var(--color-beige)]/70 underline underline-offset-2 hover:text-[var(--color-beige)]"
          >
            {t("backToSignIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
