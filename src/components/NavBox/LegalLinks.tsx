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
    <div className="mt-6 text-sm text-gray-600 flex justify-center space-x-2">
      {LINKS.map((item, index) => (
        <React.Fragment key={item.href}>
          <Link href={item.href} className="hover:underline">
            {t(item.key)}
          </Link>
          {index < LINKS.length - 1 && <span className="text-gray-400">Â·</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
