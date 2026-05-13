"use client";

import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import { useT } from "@/components/Language/useT";

export default function AccountHeader({
  email,
  canAccessAdmin = false,
}: {
  email: string;
  canAccessAdmin?: boolean;
}) {
  const t = useT();

  return (
    <div className="w-full border border-white/15 bg-[#3f5666]/82 px-6 py-5 md:px-8 md:py-6 shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm space-y-4 text-[var(--color-beige)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="border-b border-[#173c59] pb-2 text-[1.3rem] tracking-wide text-[var(--color-beige)] md:border-b-0 md:pb-0">
          {t("accountHeaderTitle")}
        </h1>
        <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgba(228,219,206,0.20)] bg-[#0d3350]/35 px-4 py-2.5 text-sm text-[var(--color-beige)] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset] md:w-auto">
          <span className="truncate font-medium tracking-wide">{email}</span>
          <div className="flex items-center gap-2">
            {canAccessAdmin && (
              <Link
                href="/admin"
                className="rounded-lg border border-[rgba(228,219,206,0.30)] px-3 py-1.5 text-xs tracking-wide text-[var(--color-beige)] transition hover:bg-[rgba(228,219,206,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/40"
              >
                Admin
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>
      </div>
      <p className="text-xs tracking-wide text-[var(--color-beige)]/70">
        {t("accountHeaderHelp")}
      </p>
    </div>
  );
}
