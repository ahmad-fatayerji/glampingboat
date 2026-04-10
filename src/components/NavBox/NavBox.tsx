"use client";

import Link from "next/link";
import LanguagePicker from "./LanguagePicker";
import LegalLinks from "./LegalLinks";
import { useT } from "@/components/Language/useT";

type NavItemKey = "ourVision" | "boat" | "book" | "buy" | "contact";

interface NavBoxProps {
  onBookClick: () => void;
  onBoatClick: () => void;
  onContactClick: () => void;
  activeItem?: NavItemKey | null;
}

export default function NavBox({
  onBookClick,
  onBoatClick,
  onContactClick,
  activeItem = null,
}: NavBoxProps) {
  const t = useT();
  const navItems = [
    { label: t("ourVision"), key: "ourVision", href: "/" },
    { label: t("boat"), key: "boat", href: "/" },
    { label: t("book"), key: "book", href: "/book" },
    { label: t("buy"), key: "buy", href: "/buy" },
    { label: t("contact"), key: "contact", href: "/contact" },
  ] as const;

  const getItemClassName = (key: NavItemKey) =>
    `w-full text-left text-[#002038] text-lg font-medium transition ${
      activeItem === key
        ? "underline underline-offset-4"
        : "hover:text-blue-600 hover:underline"
    }`;

  const renderActiveMarker = (isActive: boolean) => (
    <span
      className={`w-8 text-3xl leading-none text-[#8f97a0] transition-opacity ${
        isActive ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      {"\u00D7"}
    </span>
  );

  return (
    <div
      className="max-w-sm p-6 rounded-2xl shadow-lg"
      style={{ backgroundColor: "#E4DBCE" }}
    >
      <div className="flex justify-center">
        <LanguagePicker />
      </div>

      <nav className="mt-6 flex flex-col space-y-3">
        {navItems.map(({ label, href, key }) => {
          const isActive = activeItem === key;

          if (key === "boat") {
            return (
              <div key={key} className="flex items-center gap-4">
                {renderActiveMarker(isActive)}
                <button onClick={onBoatClick} className={getItemClassName(key)}>
                  {label}
                </button>
              </div>
            );
          }

          if (key === "book") {
            return (
              <div key={key} className="flex items-center gap-4">
                {renderActiveMarker(isActive)}
                <button onClick={onBookClick} className={getItemClassName(key)}>
                  {label}
                </button>
              </div>
            );
          }

          if (key === "contact") {
            return (
              <div key={key} className="flex items-center gap-4">
                {renderActiveMarker(isActive)}
                <button
                  onClick={onContactClick}
                  className={getItemClassName(key)}
                >
                  {label}
                </button>
              </div>
            );
          }

          return (
            <div key={key} className="flex items-center gap-4">
              {renderActiveMarker(isActive)}
              <Link href={href} className={getItemClassName(key)}>
                {label}
              </Link>
            </div>
          );
        })}
        <LegalLinks />
      </nav>
    </div>
  );
}
