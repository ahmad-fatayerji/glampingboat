"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import {
  memo,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useT } from "@/components/Language/useT";
import hammockDeckImage from "../../../public/images/our vision/optimized/Shotcut_00_00_00_000.webp";
import mooredDeckImage from "../../../public/images/our vision/optimized/Shotcut_00_00_03_987.webp";
import cyclingGuestImage from "../../../public/images/our vision/optimized/Shotcut_00_00_03_987D.webp";
import riverCruiseImage from "../../../public/images/our vision/optimized/Shotcut_00_00_03_987SZ.webp";

interface VisionDrawerProps {
  onClose?: () => void;
}

interface VisionSlide {
  topSrc: StaticImageData;
  topAlt: string;
  bottomSrc: StaticImageData;
  bottomAlt: string;
  title: string;
  tags: string;
}

const VISION_IMAGE_SIZES =
  "(min-width: 1280px) 64vw, (min-width: 1024px) 72vw, (min-width: 640px) 82vw, 100vw";

const Controls = memo(function Controls({
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
});

const PageShell = memo(function PageShell({
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
    <div className="relative h-[calc(100vh-1.5rem)] w-full overflow-hidden bg-transparent p-3 sm:h-[calc(100vh-3rem)] sm:p-4">
      <Controls
        onPrev={onPrev}
        onNext={onNext}
        onClose={onClose}
        prevLabel={prevLabel}
        nextLabel={nextLabel}
        closeLabel={closeLabel}
      />
      <div className="h-full w-full overflow-hidden bg-transparent">
        {children}
      </div>
    </div>
  );
});

const VisionImage = memo(function VisionImage({
  src,
  alt,
  priority,
}: {
  src: StaticImageData;
  alt: string;
  priority: boolean;
}) {
  return (
    <div className="relative overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={VISION_IMAGE_SIZES}
        priority={priority}
        placeholder="blur"
        quality={76}
        className="object-cover"
      />
    </div>
  );
});

const SlidePage = memo(function SlidePage({
  slide,
  onPrev,
  onNext,
  onClose,
  prevLabel,
  nextLabel,
  closeLabel,
  priority,
}: {
  slide: VisionSlide;
  onPrev: () => void;
  onNext: () => void;
  onClose?: () => void;
  prevLabel: string;
  nextLabel: string;
  closeLabel: string;
  priority: boolean;
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
      <div className="relative grid h-full grid-rows-2 gap-[2px] bg-white">
        <VisionImage src={slide.topSrc} alt={slide.topAlt} priority={priority} />
        <VisionImage
          src={slide.bottomSrc}
          alt={slide.bottomAlt}
          priority={priority}
        />

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
});

export default function VisionDrawer({ onClose }: VisionDrawerProps) {
  const t = useT();
  const [page, setPage] = useState(0);

  const slides: VisionSlide[] = useMemo(
    () => [
      {
        topSrc: mooredDeckImage,
        topAlt: "Glamping Boat moored on the shore with guests relaxing on deck",
        bottomSrc: cyclingGuestImage,
        bottomAlt: "Guest cycling past the moored Glamping Boat",
        title: t("visionGlampTitle"),
        tags: t("visionGlampTags"),
      },
      {
        topSrc: riverCruiseImage,
        topAlt: "Aerial view of the Glamping Boat cruising along a river",
        bottomSrc: hammockDeckImage,
        bottomAlt: "Guest resting in a hammock on the Glamping Boat deck",
        title: t("visionSynergiesTitle"),
        tags: t("visionSynergiesTags"),
      },
    ],
    [t]
  );

  const pageCount = slides.length;
  const prev = useCallback(
    () => setPage((value) => (value - 1 + pageCount) % pageCount),
    [pageCount]
  );
  const next = useCallback(
    () => setPage((value) => (value + 1) % pageCount),
    [pageCount]
  );
  const prevLabel = useMemo(() => t("previous"), [t]);
  const nextLabel = useMemo(() => t("next"), [t]);
  const closeLabel = useMemo(() => t("close"), [t]);

  return (
    <SlidePage
      slide={slides[page]}
      onPrev={prev}
      onNext={next}
      onClose={onClose}
      prevLabel={prevLabel}
      nextLabel={nextLabel}
      closeLabel={closeLabel}
      priority={page === 0}
    />
  );
}
