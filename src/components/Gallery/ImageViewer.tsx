"use client";

import Image from "next/image";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/components/Language/useT";

export interface ViewerImage {
  src: string;
  alt: string;
  /** Translated caption shown in the header and as the thumbnail title. */
  label: string;
}

interface ImageViewerProps {
  images: ViewerImage[];
  /** Index into `images`, or null when the viewer is closed. */
  activeIndex: number | null;
  onClose: () => void;
  onSelect: (index: number) => void;
}

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

export default function ImageViewer({
  images,
  activeIndex,
  onClose,
  onSelect,
}: ImageViewerProps) {
  const t = useT();
  const count = images.length;
  const activeImage = activeIndex == null ? null : images[activeIndex];

  useEffect(() => {
    if (activeIndex == null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex == null || count === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        onSelect((activeIndex - 1 + count) % count);
      }
      if (event.key === "ArrowRight") {
        onSelect((activeIndex + 1) % count);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, count, onClose, onSelect]);

  if (!activeImage || activeIndex == null || typeof document === "undefined") {
    return null;
  }

  const previousIndex = (activeIndex - 1 + count) % count;
  const nextIndex = (activeIndex + 1) % count;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#002038]/88 p-0 text-[var(--color-beige)] backdrop-blur-md sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={activeImage.label}
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
                {activeImage.label}
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
              src={activeImage.src}
              alt={activeImage.alt}
              fill
              unoptimized
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
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Open ${image.alt}`}
              title={image.label}
              className={`relative h-16 min-w-[5.5rem] overflow-hidden outline-none transition sm:h-20 sm:min-w-0 sm:flex-1 ${
                index === activeIndex
                  ? "opacity-100 ring-2 ring-[var(--color-beige)] ring-inset"
                  : "opacity-68 hover:opacity-100"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                unoptimized
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
