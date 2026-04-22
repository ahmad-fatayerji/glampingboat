"use client";

import LogoutButton from "@/components/auth/LogoutButton";
import { useT } from "@/components/Language/useT";

export default function AccountHeader({ email }: { email: string }) {
  const t = useT();

  return (
    <div className="w-full border border-white/15 bg-[#3f5666]/82 px-6 py-5 md:px-8 md:py-6 shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm space-y-4 text-[var(--color-beige)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="border-b border-[#173c59] pb-2 text-[1.3rem] tracking-wide text-[var(--color-beige)] md:border-b-0 md:pb-0">
          {t("accountHeaderTitle")}
        </h1>
        <div className="flex items-center justify-between gap-4 rounded-md border border-[#0d3350] bg-[var(--color-beige)] px-4 py-2 text-sm text-[var(--color-blue)] w-full md:w-auto">
          <span className="truncate font-medium">{email}</span>
          <LogoutButton />
        </div>
      </div>
      <p className="text-xs tracking-wide text-[var(--color-beige)]/70">
        {t("accountHeaderHelp")}
      </p>
    </div>
  );
}
