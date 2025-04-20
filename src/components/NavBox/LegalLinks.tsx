// src/components/LegalLinks.tsx
"use client"

import Link from "next/link"
import React from "react"

const LINKS = [
  { label: "Legal notices",       href: "/legal-notices" },
  { label: "Cookies",             href: "/cookies" },
  { label: "Terms and conditions", href: "/terms" },
]

export default function LegalLinks() {
  return (
    <div className="mt-6 text-sm text-gray-600 flex justify-center space-x-2">
      {LINKS.map((item, i) => (
        <React.Fragment key={item.href}>
          <Link
            href={item.href}
            className="hover:underline"
          >
            {item.label}
          </Link>
          {i < LINKS.length - 1 && <span className="text-gray-400">·</span>}
        </React.Fragment>
      ))}
    </div>
  )
}
