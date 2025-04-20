// src/components/LanguagePicker.tsx
"use client"

import { usePathname, useRouter } from "next/navigation"
import Drop from "./Drop"

const LANGS = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
  { code: "nl", label: "NL" },
  { code: "ru", label: "RU" },
  { code: "es", label: "ES" },
  { code: "it", label: "IT" },
]

export default function LanguagePicker() {
  const router = useRouter()
  const path = usePathname()

  const switchTo = (locale: string) => {
    // uncomment & configure your i18n in next.config.js
    // router.push(path, path, { locale })
  }

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
          <Drop className="absolute inset-0 w-full h-full" />

          {/* 2) code text */}
          <span className="relative text-xs font-medium text-[#000000]">
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}
