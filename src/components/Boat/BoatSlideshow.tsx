"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import DrawerSurface from "@/components/Drawer/DrawerSurface";
import { useT, type TranslationKey } from "@/components/Language/useT";

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

const DRAWER_IMAGE_SIZES =
  "(min-width: 1280px) 64vw, (min-width: 1024px) 72vw, (min-width: 640px) 82vw, 100vw";
const COLLAGE_THIRD_SIZES =
  "(min-width: 1280px) 21vw, (min-width: 1024px) 24vw, (min-width: 640px) 28vw, 33vw";
const COLLAGE_LARGE_SIZES =
  "(min-width: 1280px) 43vw, (min-width: 1024px) 48vw, (min-width: 640px) 55vw, 67vw";
const COLLAGE_SIDE_SIZES =
  "(min-width: 1280px) 21vw, (min-width: 1024px) 24vw, (min-width: 640px) 27vw, 33vw";
const GALLERY_INDEXES = [0, 1, 2, 3, 4, 5, 6];
const GALLERY_LABEL_KEYS = [
  "boatGalleryLivingArea",
  "boatGallerySleepingQuarters",
  "boatGalleryKitchenette",
  "boatGalleryDeck",
  "boatGallerySanitaryFacilities",
  "boatGalleryCabinDetails",
  "boatGalleryExterior",
] satisfies TranslationKey[];

function ChevronIcon({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={direction === "previous" ? "M15 5L8 12L15 19" : "M9 5L16 12L9 19"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function WaveMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 74 18"
      className="h-4 w-20 text-[var(--color-beige)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 9C7 2.5 13 2.5 19 9C25 15.5 31 15.5 37 9C43 2.5 49 2.5 55 9C61 15.5 67 15.5 73 9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="5"
      />
    </svg>
  );
}

function ImageTile({
  src,
  alt,
  sizes,
  priority = false,
  onOpen,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  onOpen?: () => void;
}) {
  const image = (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={74}
      className="object-cover transition duration-300 group-hover:scale-[1.025] group-hover:opacity-90"
    />
  );

  if (!onOpen) {
    return <div className="relative overflow-hidden">{image}</div>;
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${alt}`}
      className="group relative overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/80"
    >
      {image}
      <span className="pointer-events-none absolute inset-0 bg-[var(--color-blue)]/0 transition group-hover:bg-[var(--color-blue)]/12" />
    </button>
  );
}

function CollageSection({
  slides,
  onOpen,
}: {
  slides: BoatSlide[];
  onOpen: (index: number) => void;
}) {
  return (
    <section className="grid min-h-[calc(100vh-3rem)] grid-rows-[36%_64%] gap-[2px] bg-white">
      <div className="grid grid-cols-3 gap-[2px]">
        <ImageTile
          src={slides[0].src}
          alt={slides[0].alt}
          sizes={COLLAGE_THIRD_SIZES}
          priority
          onOpen={() => onOpen(0)}
        />
        <ImageTile
          src={slides[1].src}
          alt={slides[1].alt}
          sizes={COLLAGE_THIRD_SIZES}
          priority
          onOpen={() => onOpen(1)}
        />
        <ImageTile
          src={slides[2].src}
          alt={slides[2].alt}
          sizes={COLLAGE_THIRD_SIZES}
          priority
          onOpen={() => onOpen(2)}
        />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-[2px]">
        <ImageTile
          src={slides[3].src}
          alt={slides[3].alt}
          sizes={COLLAGE_LARGE_SIZES}
          priority
          onOpen={() => onOpen(3)}
        />
        <div className="grid grid-rows-2 gap-[2px]">
          <ImageTile
            src={slides[4].src}
            alt={slides[4].alt}
            sizes={COLLAGE_SIDE_SIZES}
            onOpen={() => onOpen(4)}
          />
          <ImageTile
            src={slides[6].src}
            alt={slides[6].alt}
            sizes={COLLAGE_SIDE_SIZES}
            onOpen={() => onOpen(6)}
          />
        </div>
      </div>
    </section>
  );
}

function PlanSection({
  slide,
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
    <section className="flex items-start justify-center bg-transparent">
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
                <span className="mr-[clamp(0.55rem,1vw,1.2rem)] font-light">
                  1
                </span>
                <span className="font-semibold">{sleepingText}</span>
              </p>
              <p>
                <span className="mr-[clamp(0.55rem,1vw,1.2rem)] font-light">
                  2
                </span>
                <span className="font-semibold">{kitchenetteText}</span>
              </p>
              <p>
                <span className="mr-[clamp(0.55rem,1vw,1.2rem)] font-light">
                  3
                </span>
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
    </section>
  );
}

function GalleryViewer({
  slides,
  activeIndex,
  onClose,
  onSelect,
}: {
  slides: BoatSlide[];
  activeIndex: number | null;
  onClose: () => void;
  onSelect: (index: number) => void;
}) {
  const t = useT();
  const activeSlide = activeIndex == null ? null : slides[activeIndex];
  const activeLabel =
    activeIndex == null ? "" : t(GALLERY_LABEL_KEYS[activeIndex]);

  useEffect(() => {
    if (activeIndex == null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex == null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      const position = GALLERY_INDEXES.indexOf(activeIndex);
      if (event.key === "ArrowLeft") {
        onSelect(
          GALLERY_INDEXES[
            (position - 1 + GALLERY_INDEXES.length) % GALLERY_INDEXES.length
          ]
        );
      }
      if (event.key === "ArrowRight") {
        onSelect(GALLERY_INDEXES[(position + 1) % GALLERY_INDEXES.length]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, onClose, onSelect]);

  if (!activeSlide || activeIndex == null || typeof document === "undefined") {
    return null;
  }

  const position = GALLERY_INDEXES.indexOf(activeIndex);
  const previousIndex =
    GALLERY_INDEXES[
      (position - 1 + GALLERY_INDEXES.length) % GALLERY_INDEXES.length
    ];
  const nextIndex = GALLERY_INDEXES[(position + 1) % GALLERY_INDEXES.length];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#002038]/88 p-0 text-[var(--color-beige)] backdrop-blur-md sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={activeLabel}
        className="flex h-[100dvh] w-full flex-col overflow-hidden border-[var(--color-beige)]/24 bg-[#2f4858]/94 shadow-[0_24px_80px_rgba(0,0,0,0.52)] ring-1 ring-white/10 sm:h-[min(90vh,58rem)] sm:w-[min(94vw,86rem)] sm:border"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative border-b border-[var(--color-beige)]/16 bg-[#2f4858]/96 px-4 py-3 sm:px-6 sm:py-4">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--color-beige)]/45 to-transparent" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold leading-none text-[var(--color-beige)]/72">
                  Glamping Boat
                </p>
                <WaveMark />
              </div>
              <p className="mt-2 truncate text-2xl font-semibold leading-tight text-[var(--color-beige)] sm:text-3xl">
                {activeLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("close")}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-[var(--color-beige)]/32 bg-[var(--color-blue)]/44 px-3 font-semibold text-[var(--color-beige)] transition hover:border-[var(--color-beige)]/55 hover:bg-[var(--color-blue)]/78 sm:px-4"
            >
              <span className="hidden sm:inline">{t("close")}</span>
              <span aria-hidden="true" className="text-lg leading-none">
                &times;
              </span>
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 bg-[#102a34]/70 p-3 sm:p-6">
          <button
            type="button"
            onClick={() => onSelect(previousIndex)}
            aria-label={t("previous")}
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-beige)]/32 bg-[#2f4858]/88 text-[var(--color-beige)] shadow-[0_12px_32px_rgba(0,0,0,0.3)] transition hover:border-[var(--color-beige)]/70 hover:bg-[var(--color-blue)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/70 sm:left-8 sm:h-14 sm:w-14"
          >
            <ChevronIcon direction="previous" />
          </button>

          <div className="relative h-full min-h-[18rem] overflow-hidden bg-[#07171c] shadow-[inset_0_0_0_1px_rgba(228,219,206,0.08)]">
            <Image
              src={activeSlide.src}
              alt={activeSlide.alt}
              fill
              sizes="100vw"
              quality={88}
              className="object-cover"
            />
          </div>

          <button
            type="button"
            onClick={() => onSelect(nextIndex)}
            aria-label={t("next")}
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-beige)]/32 bg-[#2f4858]/88 text-[var(--color-beige)] shadow-[0_12px_32px_rgba(0,0,0,0.3)] transition hover:border-[var(--color-beige)]/70 hover:bg-[var(--color-blue)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/70 sm:right-8 sm:h-14 sm:w-14"
          >
            <ChevronIcon direction="next" />
          </button>
        </div>

        <div className="flex gap-[2px] overflow-x-auto border-t border-[var(--color-beige)]/16 bg-[#2f4858]/96 p-[2px]">
          {GALLERY_INDEXES.map((index) => (
            <button
              key={slides[index].src}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Open ${slides[index].alt}`}
              title={t(GALLERY_LABEL_KEYS[index])}
              className={`relative h-16 min-w-[5.5rem] overflow-hidden outline-none transition sm:h-20 sm:min-w-0 sm:flex-1 ${
                index === activeIndex
                  ? "opacity-100 ring-2 ring-[var(--color-beige)] ring-inset"
                  : "opacity-68 hover:opacity-100"
              }`}
            >
              <Image
                src={slides[index].src}
                alt={slides[index].alt}
                fill
                sizes="14vw"
                quality={55}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function BoatSlideshow({ slides }: BoatSlideshowProps) {
  const t = useT();
  const [activeImage, setActiveImage] = useState<number | null>(null);

  if (slides.length < 8) return null;

  return (
    <DrawerSurface className="gap-8 overflow-hidden !bg-transparent !p-3 !shadow-none !backdrop-blur-0 sm:!p-4">
      <CollageSection slides={slides} onOpen={setActiveImage} />

      <PlanSection
        slide={slides[7]}
        sleepingText={t("boatPlanSleeping")}
        kitchenetteText={t("boatPlanKitchenette")}
        centerText={t("boatPlanDeck")}
        electricMotorText={t("boatPlanElectricMotor")}
        clearWaterText={t("boatPlanClearWater")}
        blackWaterText={t("boatPlanBlackWater")}
        noChoresText={t("boatPlanNoChores")}
        noLicenceBoatText={t("boatPlanNoLicenceBoat")}
      />

      <GalleryViewer
        slides={slides}
        activeIndex={activeImage}
        onClose={() => setActiveImage(null)}
        onSelect={setActiveImage}
      />
    </DrawerSurface>
  );
}
