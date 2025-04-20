// src/components/WaveToggle.tsx
"use client"

import { useState } from "react"
import NavBox from "./NavBox"

export default function WaveToggle() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* floating wave button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        className="fixed top-4 left-4 z-50 p-2 bg-transparent"
      >
        {/* replace this <svg> with your actual waves.svg contents */}
        <svg
          width={32}
          height={32}
          viewBox="0 0 64 64"
          fill="#E4DBCE"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 16c8-4 16 4 24 0s16-4 24 0v8c-8-4-16 4-24 0s-16-4-24 0v-8z" />
          <path d="M8 32c8-4 16 4 24 0s16-4 24 0v8c-8-4-16 4-24 0s-16-4-24 0v-8z" />
          <path d="M8 48c8-4 16 4 24 0s16-4 24 0v8c-8-4-16 4-24 0s-16-4-24 0v-8z" />
        </svg>
      </button>

      {/* the sliding‑in NavBox */}
      {open && (
        <div className="fixed bottom-4 left-4 z-40 transition-transform transform translate-y-0">
          <NavBox />
        </div>
      )}
    </>
  )
}
