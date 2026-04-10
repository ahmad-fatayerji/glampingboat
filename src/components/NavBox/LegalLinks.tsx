"use client";

import Link from "next/link";
import React from "react";
import { useT } from "@/components/Language/useT";
import type { TranslationKey } from "@/components/Language/dictionaries";

const LINKS = [
  { key: "legal", href: "/legal-notices" },
  { key: "cookies", href: "/cookies" },
  { key: "terms", href: "/terms" },
] as const satisfies ReadonlyArray<{ key: TranslationKey; href: string }>;

export default function LegalLinks() {
  const t = useT();

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-y-1 text-center text-xs leading-snug text-gray-600 sm:text-sm">
      {LINKS.map((item, index) => (
        <React.Fragment key={item.href}>
          <Link href={item.href} className="hover:underline">
            {t(item.key)}
          </Link>
          {index < LINKS.length - 1 && (
            <span className="px-2 text-gray-400" aria-hidden="true">
              {"\u00B7"}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
