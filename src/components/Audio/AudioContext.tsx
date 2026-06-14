"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface AudioContextValue {
  muted: boolean;
  toggleMute: () => void;
  registerMediaElement: (element: HTMLMediaElement | null) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export const AudioProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const [muted, setMuted] = useState(true);

  const registerMediaElement = useCallback(
    (element: HTMLMediaElement | null) => {
      mediaRef.current = element;
      if (element) {
        element.muted = muted;
      }
    },
    [muted]
  );

  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.muted = muted;
    }
  }, [muted]);

  const toggleMute = () => {
    const media = mediaRef.current;

    if (!media) {
      setMuted((current) => !current);
      return;
    }

    if (muted) {
      media.muted = false;
      media
        .play()
        .then(() => {
          setMuted(false);
        })
        .catch((error) => {
          media.muted = true;
          console.warn("Video playback blocked:", error);
        });
    } else {
      media.muted = true;
      setMuted(true);
    }
  };

  return (
    <AudioContext.Provider value={{ muted, toggleMute, registerMediaElement }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextValue => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
};
