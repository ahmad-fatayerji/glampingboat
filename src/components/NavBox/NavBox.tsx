"use client";

import LanguagePicker from "./LanguagePicker";
import Link from "next/link";
import LegalLinks from "./LegalLinks";

interface NavBoxProps {
  onBookClick: () => void;
  onBoatClick: () => void;
  onContactClick: () => void;
}

const NAV_ITEMS = [
  { label: "Our Vision", href: "/" },
  { label: "Boat", href: "/" }, // intercepted
  { label: "Book", href: "/book" }, // intercepted
  { label: "Buy", href: "/buy" },
  { label: "Contact", href: "/contact" }, // intercepted
];

export default function NavBox({
  onBookClick,
  onBoatClick,
  onContactClick,
}: NavBoxProps) {
  return (
    <div
      className="max-w-sm p-6 rounded-2xl shadow-lg"
      style={{ backgroundColor: "#E4DBCE" }}
    >
      <div className="flex justify-center">
        <LanguagePicker />
      </div>

      <nav className="mt-6 flex flex-col space-y-3">
        {NAV_ITEMS.map(({ label, href }) => {
          if (label === "Boat") {
            return (
              <button
                key="boat"
                onClick={onBoatClick}
                className="w-full text-left text-[#002038] text-lg font-medium hover:text-blue-600 hover:underline"
              >
                Boat
              </button>
            );
          } else if (label === "Book") {
            return (
              <button
                key="book"
                onClick={onBookClick}
                className="w-full text-left text-[#002038] text-lg font-medium hover:text-blue-600 hover:underline"
              >
                Book
              </button>
            );
          } else if (label === "Contact") {
            return (
              <button
                key="contact"
                onClick={onContactClick}
                className="w-full text-left text-[#002038] text-lg font-medium hover:text-blue-600 hover:underline"
              >
                Contact
              </button>
            );
          } else {
            return (
              <Link
                key={href}
                href={href}
                className="text-[#002038] text-lg font-medium hover:text-blue-600 hover:underline"
              >
                {label}
              </Link>
            );
          }
        })}
        <LegalLinks />
      </nav>
    </div>
  );
}
