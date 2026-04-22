"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/account" })}
      className="rounded-xl bg-[#0d3350] px-4 py-1.5 text-xs lowercase tracking-wide text-[var(--color-beige)] transition hover:bg-[#123f61] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/60"
    >
      logout
    </button>
  );
}
