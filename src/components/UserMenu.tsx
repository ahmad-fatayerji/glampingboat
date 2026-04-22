"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useT } from "@/components/Language/useT";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const userInitial =
    session?.user?.name?.[0]?.toUpperCase() ??
    session?.user?.email?.[0]?.toUpperCase() ??
    "U";

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (pathname.startsWith("/account")) return null;

  return (
    <div ref={ref} className="fixed top-4 right-4 z-50 profile-shift-with-drawer">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={session ? t("openAccountMenu") : t("openSignInMenu")}
        className={`flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-beige)]/70 text-[var(--color-beige)] shadow-[0_10px_30px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-white/10 backdrop-blur-sm transition hover:border-[var(--color-beige)] hover:bg-[#3f5666] ${
          session ? "bg-[#3f5666]/92" : "bg-[#3f5666]/82"
        }`}
      >
        {status === "loading" ? (
          <span className="h-4 w-4 animate-pulse rounded-full bg-current/55" />
        ) : session?.user?.email ? (
          <span className="text-sm font-semibold">{userInitial}</span>
        ) : (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="opacity-90"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 19c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
          </svg>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-[min(19.5rem,calc(100vw-2rem))] border border-white/15 bg-[#3f5666]/92 p-3 text-sm text-[var(--color-beige)] shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm"
        >
          {session ? (
            <div className="space-y-2">
              <div className="border-b border-[#173c59] px-2 pb-3">
                <p className="text-[0.66rem] uppercase tracking-[0.28em] text-[var(--color-beige)]/60">
                  {t("accountMenu")}
                </p>
                <p className="mt-2 break-all text-[0.88rem] leading-5 text-[var(--color-beige)]/90">
                  {session.user?.email}
                </p>
              </div>
              <Link
                href="/account?tab=bookings"
                className="block rounded-md px-4 py-3 text-[var(--color-beige)] transition hover:bg-[#0d3350]/40"
                onClick={() => setOpen(false)}
              >
                {t("bookingsMenu")}
              </Link>
              <Link
                href="/account?tab=profile"
                className="block rounded-md px-4 py-3 text-[var(--color-beige)] transition hover:bg-[#0d3350]/40"
                onClick={() => setOpen(false)}
              >
                {t("profileMenu")}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full rounded-md px-4 py-3 text-left text-[#f0b4a8] transition hover:bg-[#a24a3f]/25"
              >
                {t("logoutMenu")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border-b border-[#173c59] px-2 pb-3">
                <p className="text-sm leading-6 text-[var(--color-beige)]/80">
                  {t("notSignedInMenu")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => signIn(undefined, { callbackUrl: "/account" })}
                className="w-full rounded-xl bg-[#0d3350] px-4 py-3 text-[var(--color-beige)] transition hover:bg-[#123f61] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/60"
              >
                {t("signInCreateAccountMenu")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
