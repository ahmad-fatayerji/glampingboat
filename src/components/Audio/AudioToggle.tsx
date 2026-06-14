"use client";

import React from "react";
import { useAudio } from "./AudioContext";
import { useT } from "@/components/Language/useT";

const SoundIcon = ({ muted }: { muted: boolean }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.28)]"
  >
    <path d="M4.75 9.4h3.2l4.35-3.55v12.3L7.95 14.6h-3.2z" />
    {muted ? (
      <>
        <path d="M16.4 9.2l3.4 5.6" />
        <path d="M19.8 9.2l-3.4 5.6" />
      </>
    ) : (
      <>
        <path d="M16.15 8.15c1.05 1 1.6 2.28 1.6 3.85s-.55 2.85-1.6 3.85" />
        <path d="M18.8 5.85c1.75 1.62 2.65 3.68 2.65 6.15s-.9 4.53-2.65 6.15" />
      </>
    )}
  </svg>
);

export const AudioToggle: React.FC = () => {
  const { muted, toggleMute } = useAudio();
  const t = useT();

  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={muted ? t("unmuteAudio") : t("muteAudio")}
      aria-pressed={!muted}
      className="shift-with-drawer fixed bottom-6 right-6 z-[100] flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-beige)]/70 bg-[#3f5666]/82 text-[var(--color-beige)] shadow-[0_10px_30px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-white/10 backdrop-blur-sm transition hover:border-[var(--color-beige)] hover:bg-[#3f5666] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/70"
    >
      <span className="relative flex h-7 w-7 items-center justify-center">
        <SoundIcon muted={muted} />
      </span>
    </button>
  );
};
