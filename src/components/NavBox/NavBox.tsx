"use client"

import LanguagePicker from "./LanguagePicker"
import Link from "next/link"
import LegalLinks from "./LegalLinks"

const NAV_ITEMS = [
  { label: "Our vision", href: "/about" },
  { label: "Boat",       href: "/boat" },
  { label: "Book",       href: "/book" },
  { label: "Buy",        href: "/buy" },
  { label: "Contact",    href: "/contact" },
]

export default function NavBox() {
  return (
    <div className="max-w-sm bg-white p-6 rounded-2xl shadow-lg">
      {/* Tear‑drop language picker */}
      <div className="flex justify-center">
        <LanguagePicker />
      </div>

      {/* Navigation links */}
      <nav className="mt-6 flex flex-col space-y-3">
        {NAV_ITEMS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="text-[#002038] text-lg font-medium hover:text-blue-600 hover:underline"
          >
            {label}
          </Link>
           
        ))}
        {/* bottom legal links */}
        <LegalLinks />
      </nav>
    </div>
  )
}
