"use client";

import React, { createContext, useContext, useRef, useState } from "react";

interface AudioContextValue {
  muted: boolean;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export const AudioProvider: React.FC<{
  src: string;
  children: React.ReactNode;
}> = ({ src, children }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    const audio = audioRef.current!;
    if (muted) {
      // user is un-muting → play & then un-mute
      audio
        .play()
        .then(() => {
          audio.muted = false;
          setMuted(false);
        })
        .catch((e) => {
          console.warn("Playback blocked:", e);
        });
    } else {
      // muting: just mute
      audio.muted = true;
      setMuted(true);
    }
  };

  return (
    <AudioContext.Provider value={{ muted, toggleMute }}>
      <audio ref={audioRef} src={src} loop preload="auto" />
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextValue => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
};
