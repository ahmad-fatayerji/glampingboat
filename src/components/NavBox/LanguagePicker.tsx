"use client"

import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"

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
    // remember to configure i18n in next.config.js
    // router.push(path, { locale })
  }

  return (
    <div className="flex items-center space-x-2">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchTo(code)}
          aria-label={`Switch to ${label}`}
          className="relative w-10 h-10 flex items-center justify-center mx-0.5"
        >
          {/* background drop shape */}
          <div className="absolute inset-0">
            <Image
              src="/svg/drop.svg"
              alt=""
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          {/* language label */}
          <span className="relative text-xs font-medium text-[#002038]">
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}
