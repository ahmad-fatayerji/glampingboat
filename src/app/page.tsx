"use client";

// Hero text overlay replicating screenshot styling
import { useLanguage } from "@/components/Language/LanguageContext";
import { useT } from "@/components/Language/useT";

export default function Home() {
  const t = useT();
  const { locale } = useLanguage();
  const heroLineHeight = locale === "fr" ? 0.86 : 0.8;
  const heroRowGap = locale === "fr" ? "0.08em" : "0";

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
            lineHeight: heroLineHeight,
            letterSpacing: "-1px",
          }}
        >
          <span className="block">{t("heroEmbrace")}</span>
          <span className="block" style={{ marginTop: heroRowGap }}>
            {t("heroASlow")}
          </span>
          <span className="block" style={{ marginTop: heroRowGap }}>
            {t("heroLifestyle")}
          </span>
        </h1>
      </div>
    </main>
  );
}
