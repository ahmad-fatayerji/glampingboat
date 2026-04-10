"use client";

import LanguagePicker from "./LanguagePicker";
import LegalLinks from "./LegalLinks";
import { useT } from "@/components/Language/useT";

type NavItemKey = "ourVision" | "boat" | "book" | "buy" | "contact";

interface NavBoxProps {
  onVisionClick: () => void;
  onBookClick: () => void;
  onBoatClick: () => void;
  onBuyClick: () => void;
  onContactClick: () => void;
  onLegalClick: () => void;
  onCookiesClick: () => void;
  onTermsClick: () => void;
  activeItem?: NavItemKey | null;
}

export default function NavBox({
  onVisionClick,
  onBookClick,
  onBoatClick,
  onBuyClick,
  onContactClick,
  onLegalClick,
  onCookiesClick,
  onTermsClick,
  activeItem = null,
}: NavBoxProps) {
  const t = useT();
  const navItems = [
    { label: t("ourVision"), key: "ourVision", onClick: onVisionClick },
    { label: t("boat"), key: "boat", onClick: onBoatClick },
    { label: t("book"), key: "book", onClick: onBookClick },
    { label: t("buy"), key: "buy", onClick: onBuyClick },
    { label: t("contact"), key: "contact", onClick: onContactClick },
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
      className="max-w-sm rounded-2xl p-6 shadow-lg"
      style={{ backgroundColor: "#E4DBCE" }}
    >
      <div className="flex justify-center">
        <LanguagePicker />
      </div>

      <nav className="mt-6 flex flex-col space-y-3">
        {navItems.map(({ label, key, onClick }) => (
          <div key={key} className="flex items-center gap-4">
            {renderActiveMarker(activeItem === key)}
            <button type="button" onClick={onClick} className={getItemClassName(key)}>
              {label}
            </button>
          </div>
        ))}
        <LegalLinks
          onLegalClick={onLegalClick}
          onCookiesClick={onCookiesClick}
          onTermsClick={onTermsClick}
        />
      </nav>
    </div>
  );
}
