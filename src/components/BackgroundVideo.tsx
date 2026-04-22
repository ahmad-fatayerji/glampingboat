"use client";

import React from "react";
import { useT } from "@/components/Language/useT";

export default function BackgroundVideo() {
  const t = useT();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <video
        className="h-full w-full object-cover"
        autoPlay
        loop
        muted
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
