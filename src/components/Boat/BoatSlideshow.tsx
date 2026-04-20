"use client";

import Image from "next/image";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useT } from "@/components/Language/useT";

export interface BoatSlide {
  src: string;
  alt: string;
  label: string;
}

interface BoatSlideshowProps {
  slides: BoatSlide[];
  auto?: boolean;
  intervalMs?: number;
  onClose?: () => void;
}

const PAGE_COUNT = 3;
const DRAWER_IMAGE_SIZES =
  "(min-width: 1280px) 64vw, (min-width: 1024px) 72vw, (min-width: 640px) 82vw, 100vw";
const COLLAGE_THIRD_SIZES =
  "(min-width: 1280px) 21vw, (min-width: 1024px) 24vw, (min-width: 640px) 28vw, 33vw";
const COLLAGE_LARGE_SIZES =
  "(min-width: 1280px) 43vw, (min-width: 1024px) 48vw, (min-width: 640px) 55vw, 67vw";
const COLLAGE_SIDE_SIZES =
  "(min-width: 1280px) 21vw, (min-width: 1024px) 24vw, (min-width: 640px) 27vw, 33vw";

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
});

const ImageTile = memo(function ImageTile({
  src,
  alt,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div className="relative overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={74}
        className="object-cover"
      />
    </div>
  );
});

const CollagePage = memo(function CollagePage({
  slides,
  onPrev,
  onNext,
  onClose,
  prevLabel,
  nextLabel,
  closeLabel,
}: {
  slides: BoatSlide[];
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
      <div className="grid h-full min-h-[calc(100vh-4rem)] grid-rows-[36%_64%] gap-[2px] bg-white sm:min-h-[calc(100vh-5rem)]">
        <div className="grid grid-cols-3 gap-[2px]">
          <ImageTile
            src={slides[0].src}
            alt={slides[0].alt}
            sizes={COLLAGE_THIRD_SIZES}
            priority
          />
          <ImageTile
            src={slides[1].src}
            alt={slides[1].alt}
            sizes={COLLAGE_THIRD_SIZES}
            priority
          />
          <ImageTile
            src={slides[2].src}
            alt={slides[2].alt}
            sizes={COLLAGE_THIRD_SIZES}
            priority
          />
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-[2px]">
          <ImageTile
            src={slides[3].src}
            alt={slides[3].alt}
            sizes={COLLAGE_LARGE_SIZES}
            priority
          />
          <div className="grid grid-rows-2 gap-[2px]">
            <ImageTile
              src={slides[4].src}
              alt={slides[4].alt}
              sizes={COLLAGE_SIDE_SIZES}
            />
            <ImageTile
              src={slides[6].src}
              alt={slides[6].alt}
              sizes={COLLAGE_SIDE_SIZES}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
});

const SingleImagePage = memo(function SingleImagePage({
  slide,
  onPrev,
  onNext,
  onClose,
  prevLabel,
  nextLabel,
  closeLabel,
}: {
  slide: BoatSlide;
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
      <div className="relative h-full min-h-[calc(100vh-4rem)] w-full sm:min-h-[calc(100vh-5rem)]">
        <Image
          src={slide.src}
          alt={slide.alt}
          fill
          sizes={DRAWER_IMAGE_SIZES}
          priority
          quality={76}
          className="object-cover"
        />
      </div>
    </PageShell>
  );
});

const DropMarker = memo(function DropMarker({
  number,
  className,
}: {
  number: string;
  className: string;
}) {
  return (
    <div className={`absolute ${className}`}>
      <svg viewBox="0 0 100 120" className="h-full w-full" aria-hidden="true">
        <path
          d="M50 6 C34 26 16 46 16 67 a34 34 0 0 0 68 0 C84 46 66 26 50 6 Z"
          fill="rgba(245, 241, 231, 0.72)"
          stroke="#002038"
          strokeWidth="5"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center pt-2 text-[1.35rem] font-medium text-[#002038] sm:text-[1.8rem]">
        {number}
      </span>
    </div>
  );
});

const AccessibilityBadge = memo(function AccessibilityBadge({
  className,
}: {
  className: string;
}) {
  return (
    <div className={`absolute ${className}`} aria-hidden="true">
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="rgba(245, 241, 231, 0.08)"
          stroke="rgba(245, 241, 231, 0.6)"
          strokeWidth="5"
        />
        <path
          d="M62 24a7 7 0 1 1 0 14a7 7 0 0 1 0-14Zm-7 19h15v9h-7v18c0 3 2 5 5 5h9c10 0 18 8 18 18c0 1-1 2-2 2h-7c-1 0-2-1-2-2c0-4-3-8-8-8h-9c-8 0-14-6-14-14V58h-8c-2 0-4-2-4-4s2-4 4-4h10V43Zm-4 36c7 12 20 19 34 19c5 0 9-1 14-3c1-1 3 0 3 1l3 6c1 1 0 3-1 4c-6 3-13 5-20 5c-18 0-34-10-43-26c-1-1 0-3 1-4l6-3c1-1 2 0 3 1Z"
          fill="rgba(245, 241, 231, 0.78)"
        />
      </svg>
    </div>
  );
});

const PlanPage = memo(function PlanPage({
  slide,
  onPrev,
  onNext,
  onClose,
  prevLabel,
  nextLabel,
  closeLabel,
  sleepingText,
  kitchenetteText,
  deckText,
  electricMotorText,
  clearWaterText,
  blackWaterText,
  noChoresText,
  noLicenceBoatText,
}: {
  slide: BoatSlide;
  onPrev: () => void;
  onNext: () => void;
  onClose?: () => void;
  prevLabel: string;
  nextLabel: string;
  closeLabel: string;
  sleepingText: string;
  kitchenetteText: string;
  deckText: string;
  electricMotorText: string;
  clearWaterText: string;
  blackWaterText: string;
  noChoresText: string;
  noLicenceBoatText: string;
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
      <div className="flex h-full min-h-[calc(100vh-4rem)] items-start justify-center bg-[rgba(255,255,255,0.08)] sm:min-h-[calc(100vh-5rem)]">
        <div className="relative w-full max-w-[1701px]">
          <div className="relative aspect-[1701/1134] w-full">
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes={DRAWER_IMAGE_SIZES}
              priority
              quality={78}
              className="object-cover"
            />

            <DropMarker number="1" className="left-[14.6%] top-[53.5%] h-[12%] w-[8.3%]" />
            <DropMarker number="2" className="left-[41%] top-[53.5%] h-[12%] w-[8.3%]" />
            <DropMarker number="3" className="left-[72.8%] top-[53.5%] h-[12%] w-[8.3%]" />
            <AccessibilityBadge className="left-[45.1%] top-[49.7%] h-[16.5%] w-[11.3%]" />

            <div className="absolute inset-x-0 top-[62.5%] bottom-0 flex bg-[rgba(31,61,84,0.84)] text-[var(--color-beige)] backdrop-blur-[1px]">
              <div className="grid min-h-0 w-full grid-rows-[auto_1fr_auto] gap-3 px-[clamp(1rem,2vw,2rem)] py-[clamp(0.9rem,1.7vw,1.4rem)]">
                <div className="grid gap-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start">
                  <div className="min-w-0 text-[clamp(0.8rem,1vw,1.08rem)] font-light leading-[1.35]">
                    <p>1 {sleepingText}</p>
                    <p>2 {kitchenetteText}</p>
                    <p>3 {deckText}</p>
                  </div>

                  <div className="min-w-0 text-left font-light leading-[1.08] md:text-right">
                    <p className="text-[clamp(1.2rem,2vw,2.25rem)]">{electricMotorText}</p>
                    <p className="mt-1 text-[clamp(0.95rem,1.55vw,1.55rem)]">
                      {clearWaterText}
                    </p>
                    <p className="mt-1 text-[clamp(0.95rem,1.55vw,1.55rem)]">
                      {blackWaterText}
                    </p>
                  </div>
                </div>

                <div />

                <div className="flex flex-col gap-1 text-[#001f38] md:flex-row md:items-end md:justify-between md:gap-5">
                  <p className="min-w-0 text-[clamp(2rem,4.7vw,4.25rem)] font-light leading-none tracking-[0.02em]">
                    {noChoresText}
                  </p>
                  <p className="min-w-0 text-[clamp(1.2rem,2.7vw,2.9rem)] font-light leading-none md:text-right">
                    {noLicenceBoatText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
});

export default function BoatSlideshow({
  slides,
  auto = false,
  intervalMs = 5000,
  onClose,
}: BoatSlideshowProps) {
  const [page, setPage] = useState(0);
  const t = useT();

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(
      () => setPage((value) => (value + 1) % PAGE_COUNT),
      intervalMs
    );
    return () => clearInterval(id);
  }, [auto, intervalMs]);

  const prev = useCallback(
    () => setPage((value) => (value - 1 + PAGE_COUNT) % PAGE_COUNT),
    []
  );
  const next = useCallback(
    () => setPage((value) => (value + 1) % PAGE_COUNT),
    []
  );
  const prevLabel = useMemo(() => t("previous"), [t]);
  const nextLabel = useMemo(() => t("next"), [t]);
  const closeLabel = useMemo(() => t("close"), [t]);
  const planLabels = useMemo(
    () => ({
      sleepingText: t("boatPlanSleeping"),
      kitchenetteText: t("boatPlanKitchenette"),
      deckText: t("boatPlanDeck"),
      electricMotorText: t("boatPlanElectricMotor"),
      clearWaterText: t("boatPlanClearWater"),
      blackWaterText: t("boatPlanBlackWater"),
      noChoresText: t("boatPlanNoChores"),
      noLicenceBoatText: t("boatPlanNoLicenceBoat"),
    }),
    [t]
  );

  if (slides.length < 8) return null;

  if (page === 0) {
    return (
      <CollagePage
        slides={slides}
        onPrev={prev}
        onNext={next}
        onClose={onClose}
        prevLabel={prevLabel}
        nextLabel={nextLabel}
        closeLabel={closeLabel}
      />
    );
  }

  if (page === 1) {
    return (
      <SingleImagePage
        slide={slides[1]}
        onPrev={prev}
        onNext={next}
        onClose={onClose}
        prevLabel={prevLabel}
        nextLabel={nextLabel}
        closeLabel={closeLabel}
      />
    );
  }

  return (
    <PlanPage
      slide={slides[7]}
      onPrev={prev}
      onNext={next}
      onClose={onClose}
      prevLabel={prevLabel}
      nextLabel={nextLabel}
      closeLabel={closeLabel}
      {...planLabels}
    />
  );
}
