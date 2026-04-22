"use client";
import Link from "next/link";
import { useT } from "@/components/Language/useT";

export default function Logo() {
  const t = useT();

  return (
    <Link
      href="/"
      className="flex items-end space-x-1 select-none group outline-none"
      aria-label={t("logoHome")}
    >
      <span
        className="text-5xl font-bold transition-colors group-hover:text-white group-focus-visible:text-white"
        style={{
          fontFamily: "Marcellus, serif",
          color: "var(--color-beige)",
        }}
      >
        Glamping Boat
      </span>
      <span
        className="leading-none transition-transform group-hover:scale-105 group-focus-visible:scale-105"
        style={{
          fontFamily: "Outfit, sans-serif",
          color: "var(--color-beige)",
          fontSize: "1.65rem",
          transform: "translateY(-0.95rem)",
          letterSpacing: "4px",
        }}
        aria-label={t("trademarkLabel")}
      >
        &trade;
      </span>
    </Link>
  );
}
