"use client"; 

import React from "react";

export default function BackgroundVideo() {
  return (
    <div className="fixed inset-0 -z-10">
      <video
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/videos/teaser.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
