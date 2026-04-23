"use client";

import { signOut } from "next-auth/react";
import { useT } from "@/components/Language/useT";

export default function LogoutButton() {
  const t = useT();

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/account" })}
      className="rounded-full bg-[var(--color-beige)] px-4 py-1.5 text-xs font-medium tracking-wide text-[var(--color-blue)] transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/60"
    >
      {t("logoutMenu")}
    </button>
  );
}
