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
        fixed bottom-6 right-6   /* bottom-right to avoid overlapping drawers */
        z-[100]
        p-2 bg-white/70 backdrop-blur rounded-full shadow-lg
        hover:bg-white/90 transition
        focus:outline-none focus:ring-2 focus:ring-indigo-500
      `}
    >
      {muted ? <SoundOffIcon /> : <SoundOnIcon />}
    </button>
  );
};
