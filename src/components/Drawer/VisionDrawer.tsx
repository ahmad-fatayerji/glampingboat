"use client";

import { useState, type ReactNode } from "react";
import { useT } from "@/components/Language/useT";

interface VisionDrawerProps {
  onClose?: () => void;
}

interface VisionSlide {
  topSrc: string;
  topAlt: string;
  bottomSrc: string;
  bottomAlt: string;
  title: string;
  tags: string;
}

function Controls({
  onPrev,
  onNext,
  onClose,
  prevLabel,
  nextLabel,
  closeLabel,
}: {
  onPrev: () => void;
  onNext: () => void;
  onClose?: () => void;
  prevLabel: string;
  nextLabel: string;
  closeLabel: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3 text-white sm:p-5">
      <button
        type="button"
        onClick={onPrev}
        aria-label={prevLabel}
        className="pointer-events-auto flex h-12 w-12 items-center justify-center text-5xl font-semibold leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition hover:scale-105"
      >
        &#8249;
      </button>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center text-5xl font-semibold leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition hover:scale-105"
        >
          &times;
        </button>
      ) : (
        <div className="h-12 w-12" />
      )}
      <button
        type="button"
        onClick={onNext}
        aria-label={nextLabel}
        className="pointer-events-auto flex h-12 w-12 items-center justify-center text-5xl font-semibold leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition hover:scale-105"
      >
        &#8250;
      </button>
    </div>
  );
}

function PageShell({
  children,
  onPrev,
  onNext,
  onClose,
  prevLabel,
  nextLabel,
  closeLabel,
}: {
  children: ReactNode;
  onPrev: () => void;
  onNext: () => void;
  onClose?: () => void;
  prevLabel: string;
  nextLabel: string;
  closeLabel: string;
}) {
  return (
    <div className="relative min-h-[calc(100vh-1.5rem)] w-full overflow-hidden bg-transparent p-3 sm:min-h-[calc(100vh-3rem)] sm:p-4">
      <Controls
        onPrev={onPrev}
        onNext={onNext}
        onClose={onClose}
        prevLabel={prevLabel}
        nextLabel={nextLabel}
        closeLabel={closeLabel}
      />
      <div className="h-full min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-transparent sm:min-h-[calc(100vh-5rem)]">
        {children}
      </div>
    </div>
  );
}

function SlidePage({
  slide,
  onPrev,
  onNext,
  onClose,
  prevLabel,
  nextLabel,
  closeLabel,
}: {
  slide: VisionSlide;
  onPrev: () => void;
  onNext: () => void;
  onClose?: () => void;
  prevLabel: string;
  nextLabel: string;
  closeLabel: string;
}) {
  return (
    <PageShell
      onPrev={onPrev}
      onNext={onNext}
      onClose={onClose}
      prevLabel={prevLabel}
      nextLabel={nextLabel}
      closeLabel={closeLabel}
    >
      <div className="relative grid h-full min-h-[calc(100vh-4rem)] grid-rows-2 gap-[2px] bg-white sm:min-h-[calc(100vh-5rem)]">
        <div className="overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.topSrc}
            alt={slide.topAlt}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.bottomSrc}
            alt={slide.bottomAlt}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-full px-[clamp(1rem,3vw,2.5rem)] text-[var(--color-beige)] drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
          <h2
            className="font-light tracking-tight"
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: "clamp(2rem,5.8vw,5rem)",
              lineHeight: 1,
              letterSpacing: "-0.5px",
              marginBottom: "0.12em",
            }}
          >
            {slide.title}
          </h2>
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-1/2 px-[clamp(1rem,3vw,2.5rem)] text-[var(--color-beige)] drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
          <p
            className="font-light"
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: "clamp(1rem,2.6vw,2rem)",
              lineHeight: 1.1,
              marginTop: "0.18em",
            }}
          >
            {slide.tags}
          </p>
        </div>
      </div>
    </PageShell>
  );
}

export default function VisionDrawer({ onClose }: VisionDrawerProps) {
  const t = useT();
  const [page, setPage] = useState(0);

  const slides: VisionSlide[] = [
    {
      topSrc: "/images/our vision/Shotcut_00_00_03_987.png",
      topAlt: "Glampingboat moored on the shore with guests relaxing on deck",
      bottomSrc: "/images/our vision/Shotcut_00_00_03_987D.png",
      bottomAlt: "Guest cycling past the moored glampingboat",
      title: t("visionGlampTitle"),
      tags: t("visionGlampTags"),
    },
    {
      topSrc: "/images/our vision/Shotcut_00_00_03_987SZ.png",
      topAlt: "Aerial view of the glampingboat cruising along a river",
      bottomSrc: "/images/our vision/Shotcut_00_00_00_000.png",
      bottomAlt: "Guest resting in a hammock on the glampingboat deck",
      title: t("visionSynergiesTitle"),
      tags: t("visionSynergiesTags"),
    },
  ];

  const pageCount = slides.length;
  const prev = () => setPage((value) => (value - 1 + pageCount) % pageCount);
  const next = () => setPage((value) => (value + 1) % pageCount);

  return (
    <SlidePage
      slide={slides[page]}
      onPrev={prev}
      onNext={next}
      onClose={onClose}
      prevLabel={t("previous")}
      nextLabel={t("next")}
      closeLabel={t("close")}
    />
  );
}
