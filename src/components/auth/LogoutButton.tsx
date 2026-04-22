"use client";

import { signOut } from "next-auth/react";
import { useT } from "@/components/Language/useT";

export default function LogoutButton() {
  const t = useT();

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/account" })}
      className="rounded-xl bg-[#0d3350] px-4 py-1.5 text-xs tracking-wide text-[var(--color-beige)] transition hover:bg-[#123f61] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/60"
    >
      {t("logoutMenu")}
    </button>
  );
}
