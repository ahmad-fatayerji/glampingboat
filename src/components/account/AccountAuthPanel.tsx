"use client";

import Link from "next/link";
import CredentialsTabs from "@/components/auth/CredentialsTabs";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { useT } from "@/components/Language/useT";

export default function AccountAuthPanel({
  googleAuthEnabled,
  signedOutRecently = false,
}: {
  googleAuthEnabled: boolean;
  signedOutRecently?: boolean;
}) {
  const t = useT();

  return (
    <div className="w-full max-w-md border border-white/15 bg-[#3f5666]/92 p-8 text-[var(--color-beige)] shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm space-y-8">
      {signedOutRecently && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-[#bdd7b7]/45 bg-[#1f5a46]/45 px-4 py-3 text-sm text-[#edf7e8]"
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#edf7e8] text-[#1f5a46]">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <span className="leading-6">{t("accountSignedOutSuccess")}</span>
        </div>
      )}
      <CredentialsTabs />
      {googleAuthEnabled ? (
        <>
          <div className="relative flex items-center gap-4 text-[10px] uppercase tracking-wider text-[var(--color-beige)]/60">
            <span className="flex-1 h-px bg-[#173c59]" />
            <span>{t("authOr")}</span>
            <span className="flex-1 h-px bg-[#173c59]" />
          </div>
          <GoogleSignInButton dark />
        </>
      ) : null}
      <div className="text-right -mt-4">
        <Link
          href="/forgot-password"
          className="text-xs text-[var(--color-beige)]/70 hover:text-[var(--color-beige)] underline underline-offset-2"
        >
          {t("authForgotPassword")}
        </Link>
      </div>
    </div>
  );
}
