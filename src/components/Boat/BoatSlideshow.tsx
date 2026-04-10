"use client";

import { useEffect, useState, type ReactNode } from "react";
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

function ImageTile({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

function CollagePage({
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
          <ImageTile src={slides[0].src} alt={slides[0].alt} />
          <ImageTile src={slides[1].src} alt={slides[1].alt} />
          <ImageTile src={slides[2].src} alt={slides[2].alt} />
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-[2px]">
          <ImageTile src={slides[3].src} alt={slides[3].alt} />
          <div className="grid grid-rows-2 gap-[2px]">
            <ImageTile src={slides[4].src} alt={slides[4].alt} />
            <ImageTile src={slides[6].src} alt={slides[6].alt} />
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function SingleImagePage({
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.src}
        alt={slide.alt}
        className="h-full min-h-[calc(100vh-4rem)] w-full object-cover sm:min-h-[calc(100vh-5rem)]"
      />
    </PageShell>
  );
}

function DropMarker({
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
}

function PlanPage({
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
      <div className="flex h-full min-h-[calc(100vh-4rem)] items-start justify-center bg-[rgba(255,255,255,0.12)] sm:min-h-[calc(100vh-5rem)]">
        <div className="relative w-full max-w-[1701px]">
          <div className="relative aspect-[1701/1134] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.alt}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <DropMarker number="1" className="left-[15.5%] top-[49%] h-[12%] w-[8.3%]" />
            <DropMarker number="2" className="left-[40.5%] top-[48%] h-[12%] w-[8.3%]" />
            <DropMarker number="3" className="left-[72.5%] top-[47%] h-[12%] w-[8.3%]" />

            <div className="absolute inset-x-0 bottom-0 bg-[rgba(31,61,84,0.82)] px-4 py-4 text-[var(--color-beige)] backdrop-blur-[1px] sm:px-6 sm:py-5">
              <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="text-lg font-light leading-[1.45] sm:text-[1.15rem]">
                  <p>1 {sleepingText}</p>
                  <p>2 {kitchenetteText}</p>
                  <p>3 {deckText}</p>
                </div>

                <div className="text-left font-light leading-[1.1] lg:text-right">
                  <p className="text-[2rem] sm:text-[2.65rem]">{electricMotorText}</p>
                  <p className="mt-2 text-[1.2rem] sm:text-[1.85rem]">
                    {clearWaterText}
                  </p>
                  <p className="mt-1 text-[1.2rem] sm:text-[1.85rem]">
                    {blackWaterText}
                  </p>
                  <div className="mt-4 flex flex-col gap-2 text-[#001f38] sm:flex-row sm:items-end sm:justify-end sm:gap-6">
                    <p className="text-[3rem] leading-none sm:text-[4.4rem]">
                      {noChoresText}
                    </p>
                    <p className="text-[2rem] leading-none sm:text-[3rem]">
                      {noLicenceBoatText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default function BoatSlideshow({
  slides,
  auto = false,
  intervalMs = 5000,
  onClose,
}: BoatSlideshowProps) {
  const [page, setPage] = useState(0);
  const pageCount = 3;
  const t = useT();

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(
      () => setPage((value) => (value + 1) % pageCount),
      intervalMs
    );
    return () => clearInterval(id);
  }, [auto, intervalMs]);

  if (slides.length < 8) return null;

  const prev = () => setPage((value) => (value - 1 + pageCount) % pageCount);
  const next = () => setPage((value) => (value + 1) % pageCount);
  const prevLabel = t("previous");
  const nextLabel = t("next");
  const closeLabel = t("close");

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
      sleepingText={t("boatPlanSleeping")}
      kitchenetteText={t("boatPlanKitchenette")}
      deckText={t("boatPlanDeck")}
      electricMotorText={t("boatPlanElectricMotor")}
      clearWaterText={t("boatPlanClearWater")}
      blackWaterText={t("boatPlanBlackWater")}
      noChoresText={t("boatPlanNoChores")}
      noLicenceBoatText={t("boatPlanNoLicenceBoat")}
    />
  );
}
