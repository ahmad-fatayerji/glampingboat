"use client";

import Link from "next/link";
import CredentialsTabs from "@/components/auth/CredentialsTabs";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { useT } from "@/components/Language/useT";

export default function AccountAuthPanel() {
  const t = useT();

  return (
    <div className="w-full max-w-md border border-white/15 bg-[#3f5666]/92 p-8 text-[var(--color-beige)] shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm space-y-8">
      <CredentialsTabs />
      <div className="relative flex items-center gap-4 text-[10px] uppercase tracking-wider text-[var(--color-beige)]/60">
        <span className="flex-1 h-px bg-[#173c59]" />
        <span>{t("authOr")}</span>
        <span className="flex-1 h-px bg-[#173c59]" />
      </div>
      <GoogleSignInButton dark />
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
