"use client";

import React from "react";
import { useAudio } from "./AudioContext";

// Replace these with your SVG/icon components if you like:
const SoundOnIcon = () => <span>🔊</span>;
const SoundOffIcon = () => <span>🔇</span>;

export const AudioToggle: React.FC = () => {
  const { muted, toggleMute } = useAudio();
  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-6 right-6 z-50 p-2 bg-white bg-opacity-70 rounded-full shadow-lg"
      aria-label={muted ? "Unmute" : "Mute"}
    >
      {muted ? <SoundOffIcon /> : <SoundOnIcon />}
    </button>
  );
};
