"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/Language/LanguageContext";
import { useT } from "@/components/Language/useT";
import { PASSWORD_RESET_RESEND_COOLDOWN_MS } from "@/lib/password-reset-cooldown";

const COOLDOWN_STORAGE_PREFIX = "glampingboat.passwordResetCooldownUntil:";
const LAST_COOLDOWN_EMAIL_KEY = "glampingboat.passwordResetCooldownEmail";

function normalizeCooldownEmail(email: string) {
  return email.trim().toLowerCase();
}

function getCooldownStorageKey(email: string) {
  const normalized = normalizeCooldownEmail(email);
  return normalized
    ? `${COOLDOWN_STORAGE_PREFIX}${encodeURIComponent(normalized)}`
    : null;
}

function readRemainingCooldown(email: string) {
  const storageKey = getCooldownStorageKey(email);
  if (!storageKey) return 0;

  const stored = Number.parseInt(
    window.sessionStorage.getItem(storageKey) ?? "0",
    10
  );
  const remaining = Number.isFinite(stored)
    ? Math.max(Math.ceil((stored - Date.now()) / 1000), 0)
    : 0;
  if (remaining === 0) {
    window.sessionStorage.removeItem(storageKey);
  }
  return remaining;
}

function clearLastCooldownEmail(email: string) {
  if (
    window.sessionStorage.getItem(LAST_COOLDOWN_EMAIL_KEY) ===
    normalizeCooldownEmail(email)
  ) {
    window.sessionStorage.removeItem(LAST_COOLDOWN_EMAIL_KEY);
  }
}

export default function ForgotPasswordPage() {
  const t = useT();
  const { locale } = useLanguage();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [cooldownEmail, setCooldownEmail] = useState("");
  const [cooldownReady, setCooldownReady] = useState(false);

  useEffect(() => {
    const storedEmail =
      window.sessionStorage.getItem(LAST_COOLDOWN_EMAIL_KEY) ?? "";
    const remaining = readRemainingCooldown(storedEmail);
    setCooldownEmail(storedEmail);
    setCooldown(remaining);
    if (remaining === 0) clearLastCooldownEmail(storedEmail);
    setCooldownReady(true);
  }, []);

  useEffect(() => {
    if (!cooldownReady || cooldown <= 0) return;
    const timer = window.setTimeout(() => {
      const remaining = readRemainingCooldown(cooldownEmail);
      setCooldown(remaining);
      if (remaining === 0) clearLastCooldownEmail(cooldownEmail);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown, cooldownEmail, cooldownReady]);

  const handleEmailChange = (value: string) => {
    const normalizedEmail = normalizeCooldownEmail(value);
    setEmail(value);
    setMessage(null);
    setError(null);
    setCooldownEmail(normalizedEmail);
    if (cooldownReady) {
      setCooldown(readRemainingCooldown(normalizedEmail));
      const storedEmail =
        window.sessionStorage.getItem(LAST_COOLDOWN_EMAIL_KEY) ?? "";
      if (storedEmail && storedEmail !== normalizedEmail) {
        window.sessionStorage.removeItem(LAST_COOLDOWN_EMAIL_KEY);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cooldownReady || isSubmitting || cooldown > 0) return;
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
        const normalizedEmail = normalizeCooldownEmail(email);
        const storageKey = getCooldownStorageKey(normalizedEmail);
        const cooldownUntil = Date.now() + PASSWORD_RESET_RESEND_COOLDOWN_MS;
        if (storageKey) {
          window.sessionStorage.setItem(storageKey, String(cooldownUntil));
          window.sessionStorage.setItem(
            LAST_COOLDOWN_EMAIL_KEY,
            normalizedEmail
          );
        }
        setCooldownEmail(normalizedEmail);
        setCooldown(Math.ceil(PASSWORD_RESET_RESEND_COOLDOWN_MS / 1000));
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
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder={t("authEmailPlaceholder")}
              required
            />
          </div>

          <button
            type="submit"
            disabled={!cooldownReady || isSubmitting || cooldown > 0}
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
