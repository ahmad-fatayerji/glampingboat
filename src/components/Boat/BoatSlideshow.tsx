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
  centerText,
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
  centerText: string;
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
      <div className="flex h-full min-h-[calc(100vh-4rem)] items-center justify-center bg-transparent sm:min-h-[calc(100vh-5rem)]">
        <div className="relative w-full max-w-[1701px]">
          <div className="relative aspect-[1701/1134] w-full">
            <div className="absolute inset-x-0 top-0 h-[64%]">
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes={DRAWER_IMAGE_SIZES}
                priority
                quality={88}
                className="object-contain"
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 h-[39%] bg-[rgba(31,61,84,0.84)] px-[clamp(1rem,2.2vw,2.5rem)] py-[clamp(0.8rem,1.5vw,1.6rem)] text-[var(--color-beige)] backdrop-blur-[1px]">
              <div className="absolute left-[4%] top-[7%] min-w-0 text-[clamp(0.78rem,1.05vw,1.15rem)] leading-[1.45]">
                <p>
                  <span className="mr-[clamp(0.55rem,1vw,1.2rem)] font-light">1</span>
                  <span className="font-semibold">{sleepingText}</span>
                </p>
                <p>
                  <span className="mr-[clamp(0.55rem,1vw,1.2rem)] font-light">2</span>
                  <span className="font-semibold">{kitchenetteText}</span>
                </p>
                <p>
                  <span className="mr-[clamp(0.55rem,1vw,1.2rem)] font-light">3</span>
                  <span className="font-semibold">{centerText}</span>
                </p>
              </div>

              <div className="absolute right-[4%] top-[9%] max-w-[42%] text-right font-light leading-[1.14]">
                <p className="text-[clamp(1.05rem,2vw,2.25rem)]">
                  {electricMotorText}
                </p>
              </div>

              <div className="absolute inset-x-[4%] top-[29%] text-right font-light leading-[1.14]">
                <p className="text-[clamp(0.92rem,1.48vw,1.62rem)]">
                  {clearWaterText}
                </p>
                <p className="text-[clamp(0.92rem,1.48vw,1.62rem)]">
                  {blackWaterText}
                </p>
              </div>

              <div className="absolute inset-x-[4%] bottom-[7%] flex items-end justify-between gap-5 text-[#002038]">
                <p className="min-w-0 text-[clamp(2rem,4.6vw,4.25rem)] font-light leading-none tracking-[0.08em]">
                  {noChoresText}
                </p>
                <p className="min-w-0 pb-[0.45%] text-right text-[clamp(1.1rem,2.6vw,2.9rem)] font-light leading-none">
                  {noLicenceBoatText}
                </p>
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
      centerText: t("boatPlanDeck"),
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
