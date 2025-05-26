// src/components/Audio/AudioToggle.tsx
"use client";

import React from "react";
import { useAudio } from "./AudioContext";

// Simple icons for demo (replace with your SVGs if you like)
const SoundOnIcon = () => <span>🔊</span>;
const SoundOffIcon = () => <span>🔇</span>;

export const AudioToggle: React.FC = () => {
  const { muted, toggleMute } = useAudio();

  return (
    <button
      onClick={toggleMute}
      aria-label={muted ? "Unmute" : "Mute"}
      className={`
        fixed top-6 right-6      /* always top-right */
        z-[100]                  /* above drawer (z-50) */
        p-2 bg-white bg-opacity-70 rounded-full shadow-lg
        focus:outline-none focus:ring-2 focus:ring-indigo-500
      `}
    >
      {muted ? <SoundOffIcon /> : <SoundOnIcon />}
    </button>
  );
};
