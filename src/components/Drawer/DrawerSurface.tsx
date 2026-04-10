"use client";

import type { ReactNode } from "react";

export default function DrawerSurface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-full p-3 sm:p-6">
      <div
        className={`mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-6xl flex-col border border-white/15 bg-[#3f5666]/82 px-5 py-4 text-[var(--color-beige)] shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:min-h-[calc(100vh-3rem)] sm:px-10 sm:py-7 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
