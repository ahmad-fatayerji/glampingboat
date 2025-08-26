"use client";

import LanguagePicker from "./LanguagePicker";
import Link from "next/link";
import LegalLinks from "./LegalLinks";
import { useT } from "@/components/Language/useT";

interface NavBoxProps {
  onBookClick: () => void;
  onBoatClick: () => void;
  onContactClick: () => void;
}

const NAV_ITEMS_KEYS = ["ourVision", "boat", "book", "buy", "contact"] as const;

export default function NavBox({
  onBookClick,
  onBoatClick,
  onContactClick,
}: NavBoxProps) {
  const t = useT();
  const NAV_ITEMS = [
    { label: t("ourVision"), key: "ourVision", href: "/" },
    { label: t("boat"), key: "boat", href: "/" },
    { label: t("book"), key: "book", href: "/book" },
    { label: t("buy"), key: "buy", href: "/buy" },
    { label: t("contact"), key: "contact", href: "/contact" },
  ] as const;
  return (
    <div
      className="max-w-sm p-6 rounded-2xl shadow-lg"
      style={{ backgroundColor: "#E4DBCE" }}
    >
      <div className="flex justify-center">
        <LanguagePicker />
      </div>

      <nav className="mt-6 flex flex-col space-y-3">
        {NAV_ITEMS.map(({ label, href, key }) => {
          if (key === "boat") {
            return (
              <button
                key={key}
                onClick={onBoatClick}
                className="w-full text-left text-[#002038] text-lg font-medium hover:text-blue-600 hover:underline"
              >
                {label}
              </button>
            );
          } else if (key === "book") {
            return (
              <button
                key={key}
                onClick={onBookClick}
                className="w-full text-left text-[#002038] text-lg font-medium hover:text-blue-600 hover:underline"
              >
                {label}
              </button>
            );
          } else if (key === "contact") {
            return (
              <button
                key={key}
                onClick={onContactClick}
                className="w-full text-left text-[#002038] text-lg font-medium hover:text-blue-600 hover:underline"
              >
                {label}
              </button>
            );
          } else {
            return (
              <Link
                key={key}
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
