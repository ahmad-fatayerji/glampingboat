"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/Language/LanguageContext";
import { useT } from "@/components/Language/useT";

export default function ForgotPasswordPage() {
  const t = useT();
  const { locale } = useLanguage();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Mirrors the server-side resend cooldown so a second click can't fire off
  // another email seconds after the first one.
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || cooldown > 0) return;
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });

      if (res.ok) {
        setMessage(t("resetEmailSent"));
        setCooldown(60);
      } else {
        const { error: err } = await res
          .json()
          .catch(() => ({ error: t("badRequest") }));
        setError(err || t("genericError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-40 pb-12">
      <div className="w-full max-w-md border border-white/15 bg-[#3f5666]/92 p-8 text-[var(--color-beige)] shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <div className="space-y-2">
          <h1 className="border-b border-[#173c59] pb-2 text-center text-[1.3rem] tracking-wide text-[var(--color-beige)]">
            {t("resetPassword")}
          </h1>
          <p className="text-center text-sm leading-relaxed text-[var(--color-beige)]/75">
            {t("resetPasswordRequestBody")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {message && (
            <p className="rounded-md border border-[#65845f] bg-[#3f6546]/35 px-3 py-2 text-sm text-[#e8f4df]">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded-md border border-[#8a3a30] bg-[#8a3a30]/25 px-3 py-2 text-sm text-[#ffd9d9]">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm text-[var(--color-beige)]/90">
              {t("email")}
            </label>
            <input
              type="email"
              className="h-10 w-full rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] px-3 text-sm text-[var(--color-blue)] outline-none transition placeholder:text-[var(--color-blue)]/45 focus:border-[#234d69]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("authEmailPlaceholder")}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || cooldown > 0}
            className="w-full rounded-xl bg-[#0d3350] py-2 text-sm tracking-wide text-[var(--color-beige)] transition hover:bg-[#123f61] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? t("sending")
              : cooldown > 0
                ? `${t("resetLinkCooldown")} ${cooldown}s`
                : t("sendResetLink")}
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
