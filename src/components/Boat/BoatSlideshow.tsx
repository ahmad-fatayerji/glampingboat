"use client";

import { useEffect, useState } from "react";

interface BoatSlideshowProps {
  images: string[];
  auto?: boolean;
  intervalMs?: number;
}

export default function BoatSlideshow({
  images,
  auto = true,
  intervalMs = 5000,
}: BoatSlideshowProps) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!auto || images.length <= 1) return;
    const id = setInterval(
      () => setI((v) => (v + 1) % images.length),
      intervalMs
    );
    return () => clearInterval(id);
  }, [auto, images.length, intervalMs]);

  const prev = () => setI((v) => (v - 1 + images.length) % images.length);
  const next = () => setI((v) => (v + 1) % images.length);

  if (!images.length) return null;

  return (
    <div className="relative w-full">
      <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden rounded-xl ring-1 ring-white/10">
        {images.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt={`Boat ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              idx === i ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
      <div className="absolute inset-y-0 left-0 flex items-center">
        <button
          onClick={prev}
          aria-label="Précédent"
          className="m-2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white"
        >
          ⟨
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          onClick={next}
          aria-label="Suivant"
          className="m-2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white"
        >
          ⟩
        </button>
      </div>
      <div className="mt-3 flex justify-center gap-1">
        {images.map((_, idx) => (
          <span
            key={idx}
            className={`h-1.5 w-5 rounded-full ${
              idx === i ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
