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
        aria-label={session ? "Open account menu" : "Open sign in menu"}
        className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition hover:shadow-xl ${
          session
            ? "bg-[var(--color-blue)] text-[var(--color-beige)] ring-2 ring-[var(--color-beige)]/60"
            : "bg-[var(--color-beige)] text-[var(--color-blue)] ring-1 ring-[var(--color-blue)]/10"
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
          className="mt-4 w-[min(19.5rem,calc(100vw-2rem))] rounded-[1.85rem] border border-[var(--color-beige)]/65 bg-[linear-gradient(180deg,rgba(228,219,206,0.96),rgba(221,211,196,0.92))] p-3 text-sm text-[var(--color-blue)] shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl"
        >
          {session ? (
            <div className="space-y-2">
              <div className="rounded-[1.35rem] border border-white/45 bg-white/30 px-4 py-3">
                <p className="text-[0.66rem] uppercase tracking-[0.28em] text-[var(--color-blue)]/42">
                  {t("accountMenu")}
                </p>
                <p className="mt-2 break-all text-[0.88rem] leading-5 text-[var(--color-blue)]/72">
                  {session.user?.email}
                </p>
              </div>
              <Link
                href="/account?tab=bookings"
                className="block rounded-[1.35rem] px-4 py-3 font-medium transition hover:bg-[var(--color-blue)]/7"
                onClick={() => setOpen(false)}
              >
                {t("bookingsMenu")}
              </Link>
              <Link
                href="/account?tab=profile"
                className="block rounded-[1.35rem] px-4 py-3 font-medium transition hover:bg-[var(--color-blue)]/7"
                onClick={() => setOpen(false)}
              >
                {t("profileMenu")}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full rounded-[1.35rem] px-4 py-3 text-left font-medium text-[#a24a3f] transition hover:bg-[#a24a3f]/7"
              >
                {t("logoutMenu")}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="rounded-[1.35rem] border border-white/45 bg-white/30 px-4 py-3">
                <p className="text-sm leading-6 text-[var(--color-blue)]/70">
                  {t("notSignedInMenu")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => signIn(undefined, { callbackUrl: "/account" })}
                className="w-full rounded-[1.35rem] bg-[var(--color-blue)] px-4 py-3 font-semibold text-[var(--color-beige)] shadow-[0_10px_24px_rgba(0,0,0,0.14)] transition hover:bg-[#0d3048] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/20"
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
