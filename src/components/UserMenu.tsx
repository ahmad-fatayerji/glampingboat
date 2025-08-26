"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function UserMenu() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Hide on account/auth page to reduce redundancy
  if (pathname.startsWith("/account")) return null;

  return (
    <div ref={ref} className="fixed top-4 right-4 z-50 shift-with-drawer">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="w-11 h-11 rounded-full bg-[var(--color-beige)] text-[var(--color-blue)] flex items-center justify-center shadow-lg ring-1 ring-[var(--color-blue)]/10 hover:shadow-xl transition"
      >
        {session?.user?.email ? (
          <span className="font-semibold text-sm">
            {session.user.email[0]?.toUpperCase()}
          </span>
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
          className="mt-2 w-56 rounded-xl bg-white/95 backdrop-blur p-3 shadow-xl ring-1 ring-black/5 text-sm text-[#002038] space-y-2"
        >
          {session ? (
            <>
              <div className="px-2 py-1 text-xs uppercase tracking-wide text-gray-500">
                {session.user?.email}
              </div>
              <Link
                href="/account"
                className="block px-3 py-2 rounded hover:bg-[#E4DBCE] font-medium"
                onClick={() => setOpen(false)}
              >
                Manage bookings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left px-3 py-2 rounded hover:bg-red-50 text-red-600 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <p className="px-2 text-gray-600 text-sm">
                You are not signed in.
              </p>
              <button
                onClick={() => signIn(undefined, { callbackUrl: "/account" })}
                className="w-full px-3 py-2 rounded-md bg-[var(--color-blue)] text-[var(--color-beige)] font-semibold shadow hover:bg-[#06324d] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/40 transition"
              >
                Sign in / Create account
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
