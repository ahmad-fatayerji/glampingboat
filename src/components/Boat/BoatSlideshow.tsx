"use client";

import Image from "next/image";
import { useState } from "react";
import DrawerSurface from "@/components/Drawer/DrawerSurface";
import ImageViewer from "@/components/Gallery/ImageViewer";
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
      unoptimized
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
              unoptimized
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

export default function BoatSlideshow({ slides }: BoatSlideshowProps) {
  const t = useT();
  const [activeImage, setActiveImage] = useState<number | null>(null);

  if (slides.length < 8) return null;

  const galleryImages = GALLERY_INDEXES.map((index) => ({
    src: slides[index].src,
    alt: slides[index].alt,
    label: t(GALLERY_LABEL_KEYS[index]),
  }));

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

      <ImageViewer
        images={galleryImages}
        activeIndex={activeImage}
        onClose={() => setActiveImage(null)}
        onSelect={setActiveImage}
      />
    </DrawerSurface>
  );
}
