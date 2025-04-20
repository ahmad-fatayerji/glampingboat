// src/components/LanguagePicker.tsx
"use client";

import LanguageDrop from "./LanguageDrop";

const AVAILABLE_LANGUAGES = ["EN", "FR", "DE", "NL", "RU", "ES", "IT"] as const;

export default function LanguagePicker() {
  return (
    <div className="flex items-center">
      {AVAILABLE_LANGUAGES.map((code) => (
        <LanguageDrop key={code} code={code} />
      ))}
    </div>
  );
}
