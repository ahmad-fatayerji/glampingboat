// src/components/LegalLinks.tsx
"use client";

import Link from "next/link";
import React from "react";
import { useT } from "@/components/Language/useT";

const LINKS = [
  { key: "legal", href: "/legal-notices" },
  { key: "cookies", href: "/cookies" },
  { key: "terms", href: "/terms" },
] as const;

export default function LegalLinks() {
  const t = useT();
  return (
    <div className="mt-6 text-sm text-gray-600 flex justify-center space-x-2">
      {LINKS.map((item, i) => (
        <React.Fragment key={item.href}>
          <Link href={item.href} className="hover:underline">
            {t(item.key as any)}
          </Link>
          {i < LINKS.length - 1 && <span className="text-gray-400">·</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
