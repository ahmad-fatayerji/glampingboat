"use client";

import BackgroundVideo from "@/components/BackgroundVideo";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Background video renders full-screen */}
      <BackgroundVideo />

      {/* Overlay content with centered text */}
      <div className="relative z-10 flex flex-col items-right justify-center min-h-screen px-4">
        <h1 
          className="text-5xl font-bold text-right"
          style={{ color: "#002038", fontFamily: "Marcellus, serif" }}
        >
          Embrace a slow lifestyle
        </h1>
        <p 
          className="mt-4 text-2xl text-right"
          style={{ color: "#002038", fontFamily: "Outfit, sans-serif" }}
        >
          Adoptez un mode de vie lent
        </p>
      </div>
    </div>
  );
}
