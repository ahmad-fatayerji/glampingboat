"use client";

import React from "react";
import { useAudio } from "@/components/Audio/AudioContext";
import { useT } from "@/components/Language/useT";

export default function BackgroundVideo() {
  const t = useT();
  const { muted, registerMediaElement } = useAudio();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <video
        ref={registerMediaElement}
        className="h-full w-full object-cover"
        autoPlay
        loop
        muted={muted}
        playsInline
        poster="/boat/1.jpg"
      >
        <source src="/videos/background-video.webm" type="video/webm" />
        {t("videoNotSupported")}
      </video>
      <div className="absolute inset-0 bg-[#001522]/35" aria-hidden="true" />
    </div>
  );
}
