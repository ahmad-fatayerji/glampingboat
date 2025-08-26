// src/components/LanguagePicker.tsx
"use client";

import Drop from "./Drop";
import { useLanguage } from "@/components/Language/LanguageContext";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
  { code: "nl", label: "NL" },
  { code: "ru", label: "RU" },
  { code: "es", label: "ES" },
  { code: "it", label: "IT" },
];

export default function LanguagePicker() {
  const { locale: active, setLocale } = useLanguage();
  const switchTo = (locale: string) => setLocale(locale as any);

  return (
    <div className="flex items-center gap-x-.1">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchTo(code)}
          aria-label={`Switch to ${label}`}
          className="relative w-10 h-10 flex items-center justify-center"
        >
          {/* 1) teardrop outline */}
          <Drop
            className="absolute inset-0 w-full h-full"
            // darken active droplet outline slightly
            style={{ stroke: code === active ? "#00162A" : "#002038" }}
          />

          {/* 2) code text */}
          <span
            className="relative text-xs font-medium"
            style={{ color: code === active ? "#00162A" : "#002038" }}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
