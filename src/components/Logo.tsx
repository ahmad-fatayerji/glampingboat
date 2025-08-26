"use client";

export default function Logo() {
  return (
    <div className="flex items-end space-x-1 select-none">
      {/* “glampingboat” in Marcellus, blue */}
      <span
        className="text-5xl font-bold"
        style={{
          fontFamily: "Marcellus, serif",
          color: "#002038",
        }}
      >
        glampingboat
      </span>
      {/* ™ in Outfit, same blue */}
      <span
        className="leading-none"
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
    </div>
  );
}
