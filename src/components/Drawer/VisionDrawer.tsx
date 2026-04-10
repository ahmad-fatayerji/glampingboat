"use client";

import DrawerSurface from "@/components/Drawer/DrawerSurface";
import { useLanguage } from "@/components/Language/LanguageContext";
import { useT } from "@/components/Language/useT";

export default function VisionDrawer() {
  const t = useT();
  const { locale } = useLanguage();
  const heroLineHeight = locale === "fr" ? 0.86 : 0.8;
  const heroRowGap = locale === "fr" ? "0.08em" : "0";

  return (
    <DrawerSurface className="justify-center">
      <div className="max-w-4xl">
        <h2
          className="font-semibold tracking-tight"
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
        </h2>
      </div>
    </DrawerSurface>
  );
}
