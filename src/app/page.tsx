"use client";

// Hero text overlay replicating screenshot styling
import { useT } from "@/components/Language/useT";

export default function Home() {
  const t = useT();
  return (
    <main className="relative w-full min-h-screen">
      {/* Hero phrase */}
      <div
        className="pointer-events-none select-none absolute left-4 sm:left-12 z-10"
        style={{ color: "#E4DBCE", top: "10.5rem" }}
      >
        <h1
          className="font-semibold tracking-tight max-w-[14ch]"
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: "clamp(3rem,9vw,7rem)",
            lineHeight: 0.8,
            letterSpacing: "-1px",
          }}
        >
          <span className="block">{t("heroEmbrace")}</span>
          <span className="block">{t("heroASlow")}</span>
          <span className="block">{t("heroLifestyle")}</span>
        </h1>
      </div>
    </main>
  );
}
