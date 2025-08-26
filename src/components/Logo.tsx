"use client";
import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-end space-x-1 select-none group outline-none"
      aria-label="Glampingboat Home"
    >
      {/* “glampingboat” in Marcellus, blue */}
      <span
        className="text-5xl font-bold transition-colors group-hover:text-[var(--color-blue)] group-focus-visible:text-[var(--color-blue)]"
        style={{
          fontFamily: "Marcellus, serif",
          color: "#002038",
        }}
      >
        glampingboat
      </span>
      {/* ™ in Outfit, same blue */}
      <span
        className="leading-none transition-transform group-hover:scale-105 group-focus-visible:scale-105"
        style={{
          fontFamily: "Outfit, sans-serif",
          color: "#002038",
          fontSize: "1.65rem",
          transform: "translateY(-0.95rem)",
          letterSpacing: "4px",
        }}
        aria-label="Trademark"
      >
        ™
      </span>
    </Link>
  );
}
