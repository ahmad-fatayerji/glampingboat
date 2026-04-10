"use client";

import LegalContent from "@/components/Legal/LegalContent";

export default function LegalNoticesDrawer() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-2 pt-2 text-[var(--color-beige)] sm:px-4 sm:pt-4">
      <div className="pb-10">
        <LegalContent kind="legal" />
      </div>
    </div>
  );
}
