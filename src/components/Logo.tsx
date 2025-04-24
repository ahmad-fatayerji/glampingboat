// src/components/Logo.tsx
"use client";

export default function Logo() {
  return (
    <div className="flex items-baseline space-x-1">
      {/* “glampingboat” in Marcellus, blue */}
      <span
        className="text-2xl font-bold"
        style={{
          fontFamily: "Marcellus, serif",
          color: "#002038",
        }}
      >
        glampingboat
      </span>
      {/* ™ in Outfit, same blue */}
      <span
        className="text-sm"
        style={{
          fontFamily: "Outfit, sans-serif",
          color: "#002038",
        }}
      >
        ™
      </span>
    </div>
  );
}
