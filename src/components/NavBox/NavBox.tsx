"use client";

import LanguagePicker from "./LanguagePicker";
import Link from "next/link";
import LegalLinks from "./LegalLinks";

interface NavBoxProps {
  onBookClick: () => void;
}

const NAV_ITEMS = [
  { label: "About", href: "/about" },
  { label: "Boat", href: "/boat" },
  { label: "Book", href: "/book" }, // intercepted
  { label: "Buy", href: "/buy" },
  { label: "Contact", href: "/contact" },
];

export default function NavBox({ onBookClick }: NavBoxProps) {
  return (
    <div className="max-w-sm bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex justify-center">
        <LanguagePicker />
      </div>
      <nav className="mt-6 flex flex-col space-y-3">
        {NAV_ITEMS.map(({ label, href }) =>
          label === "Book" ? (
            <button
              key={href}
              onClick={onBookClick}
              className="w-full text-left text-[#002038] text-lg font-medium hover:text-blue-600 hover:underline"
            >
              {label}
            </button>
          ) : (
            <Link
              key={href}
              href={href}
              className="text-[#002038] text-lg font-medium hover:text-blue-600 hover:underline"
            >
              {label}
            </Link>
          )
        )}
        <LegalLinks />
      </nav>
    </div>
  );
}
