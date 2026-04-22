"use client";

import { useT } from "@/components/Language/useT";

export default function Loading() {
  const t = useT();

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 pt-32 pb-16 text-[var(--color-beige)]">
      <div
        className="w-full max-w-sm border border-white/15 bg-[#3f5666]/82 px-6 py-7 text-center shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-beige)]/25 bg-[var(--color-blue)]/35">
          <span className="relative block h-8 w-8" aria-hidden="true">
            <span className="absolute inset-0 rounded-full border-2 border-[var(--color-beige)]/25" />
            <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[var(--color-beige)]" />
          </span>
        </div>
        <p className="text-xs tracking-[0.28em] text-[var(--color-beige)]/65">
          Glamping Boat
        </p>
        <h1 className="mt-2 text-xl tracking-wide text-[var(--color-beige)]">
          {t("loading")}
        </h1>
      </div>
    </main>
  );
}
