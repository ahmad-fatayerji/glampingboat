"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import DrawerSurface from "@/components/Drawer/DrawerSurface";
import { useT } from "@/components/Language/useT";
import hammockDeckImage from "../../../public/images/our vision/optimized/Shotcut_00_00_00_000.webp";
import mooredDeckImage from "../../../public/images/our vision/optimized/Shotcut_00_00_03_987.webp";
import cyclingGuestImage from "../../../public/images/our vision/optimized/Shotcut_00_00_03_987D.webp";
import riverCruiseImage from "../../../public/images/our vision/optimized/Shotcut_00_00_03_987SZ.webp";

interface VisionDrawerProps {
  onClose?: () => void;
}

interface VisionSection {
  topSrc: StaticImageData;
  topAlt: string;
  bottomSrc: StaticImageData;
  bottomAlt: string;
  title: string;
  tags: string;
}

const VISION_IMAGE_SIZES =
  "(min-width: 1280px) 64vw, (min-width: 1024px) 72vw, (min-width: 640px) 82vw, 100vw";

function VisionImage({
  src,
  alt,
  priority = false,
}: {
  src: StaticImageData;
  alt: string;
  priority?: boolean;
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
}

function VisionImageSection({
  section,
  priority = false,
}: {
  section: VisionSection;
  priority?: boolean;
}) {
  return (
    <section className="relative min-h-[calc(100vh-3rem)] overflow-hidden bg-transparent">
      <div className="relative grid min-h-[calc(100vh-3rem)] grid-rows-2 gap-[2px] bg-white">
        <VisionImage
          src={section.topSrc}
          alt={section.topAlt}
          priority={priority}
        />
        <VisionImage
          src={section.bottomSrc}
          alt={section.bottomAlt}
          priority={priority}
        />

        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-full px-[clamp(1rem,3vw,2.5rem)] text-[var(--color-beige)] drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
          <h2 className="text-[clamp(2rem,5.8vw,5rem)] font-light leading-none">
            {section.title}
          </h2>
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-1/2 px-[clamp(1rem,3vw,2.5rem)] text-[var(--color-beige)] drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
          <p className="mt-[0.18em] text-[clamp(1rem,2.6vw,2rem)] font-light leading-[1.1]">
            {section.tags}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function VisionDrawer({}: VisionDrawerProps) {
  const t = useT();
  const sections: VisionSection[] = [
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
  ];

  return (
    <DrawerSurface className="gap-8 overflow-hidden !bg-transparent !p-3 !shadow-none !backdrop-blur-0 sm:!p-4">
      <VisionImageSection section={sections[0]} priority />

      <section
        id="vision-video"
        className="overflow-hidden bg-[var(--color-blue)] shadow-[inset_0_0_0_1px_rgba(228,219,206,0.14)]"
      >
        <div className="relative aspect-video w-full">
          <iframe
            src="https://www.youtube-nocookie.com/embed/pmIdY-dvp5s"
            title="Glamping Boat vision video"
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      <VisionImageSection section={sections[1]} />
    </DrawerSurface>
  );
}
