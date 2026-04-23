"use client";

import Image from "next/image";
import { format } from "date-fns";
import { useT } from "@/components/Language/useT";
import {
  calculateReservationPricingSummary,
  calculateNightCount,
} from "@/lib/reservations";

interface BookingSpecPreviewProps {
  arrivalDate: Date;
  departureDate: Date;
  adults: number;
  childrenCount: number;
  onBack: () => void;
  onContinue: () => void;
}

const highlights = [
  {
    title: "The Lot Valley",
    body: "A slow 6 mile river stretch through Aveyron, with locks, cycling routes, thermalism, and Compostela paths nearby.",
    src: "/images/book/river.jpg",
  },
  {
    title: "River route",
    body: "Boisse-Penchot, Livinhac-le-Haut, Flagnac, and Port d'Agres form the navigation area shown in the book section.",
    src: "/images/book/plan-eau.png",
  },
  {
    title: "Boat layout",
    body: "Double bed, bunk beds, kitchenette, bathroom, steering position, aft deck, hammock support, and accessible boarding.",
    src: "/images/book/Image1.png",
  },
] as const;

const detailImages = [
  { src: "/images/book/chambre.jpg", label: "Sleeping area" },
  { src: "/images/book/cuisine.jpg", label: "Kitchenette" },
  { src: "/images/book/wc.jpg", label: "Bathroom" },
] as const;

function fmtEuro(value: number) {
  return `\u20AC${value.toFixed(2)}`;
}

function fmtDate(date: Date) {
  return format(date, "MM/dd/yyyy");
}

export default function BookingSpecPreview({
  arrivalDate,
  departureDate,
  adults,
  childrenCount,
  onBack,
  onContinue,
}: BookingSpecPreviewProps) {
  const t = useT();
  const pricing = calculateReservationPricingSummary({
    arrivalDate,
    departureDate,
    adults,
    children: childrenCount,
    selectedOptions: [],
  });
  const nights = calculateNightCount(arrivalDate, departureDate);

  return (
    <div className="flex w-full flex-col gap-6 text-[var(--color-beige)]">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-[var(--color-beige)]/80 hover:text-[var(--color-beige)]"
        >
          &lsaquo; {t("previous")}
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-md bg-[var(--color-blue)] px-5 py-2 text-sm font-medium text-[var(--color-beige)] transition hover:bg-[#06324d]"
        >
          {t("next")} &gt;
        </button>
      </div>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[18rem] overflow-hidden border border-white/15 bg-[#0d3350]/25">
          <Image
            src="/images/book/pont.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
          <div className="relative flex h-full min-h-[18rem] flex-col justify-end p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-beige)]/70">
              {t("book")}
            </p>
            <h2 className="mt-2 max-w-xl font-serif text-4xl leading-tight text-[var(--color-beige)] md:text-5xl">
              {t("bookingPreviewTitle")}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--color-beige)]/86">
              {t("bookingPreviewBody")}
            </p>
          </div>
        </div>

        <aside className="border border-white/15 bg-[#0d3350]/35 p-5">
          <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-beige)]/65">
            {t("availableForChosenDates")}
          </div>
          <div className="mt-3 font-serif text-3xl text-[var(--color-beige)]">
            {fmtEuro(pricing.total)}
          </div>
          <div className="mt-2 space-y-1 text-sm text-[var(--color-beige)]/80">
            <p>
              {fmtDate(arrivalDate)} - {fmtDate(departureDate)}
            </p>
            <p>
              {nights} {nights === 1 ? t("nightSingular") : t("nightPlural")} -{" "}
              {adults} {t("adultsShort")}
              {childrenCount > 0
                ? ` + ${childrenCount} ${t("childrenShort")}`
                : ""}
            </p>
            <p>{t("pricePreviewIncludesTax")}</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <Amount label={t("deposit")} value={pricing.deposit} />
            <Amount label={t("balance")} value={pricing.balance} />
          </div>
        </aside>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="overflow-hidden border border-white/12 bg-[#0d3350]/25"
          >
            <div className="relative aspect-[16/10]">
              <Image
                src={item.src}
                alt=""
                fill
                sizes="(min-width: 768px) 26vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-serif text-xl text-[var(--color-beige)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-beige)]/78">
                {item.body}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="border border-white/12 bg-[#0d3350]/25 p-5">
          <h3 className="font-serif text-2xl text-[var(--color-beige)]">
            {t("bookingNatureTitle")}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-beige)]/78">
            {t("bookingNatureBody")}
          </p>
          <div className="relative mt-4 aspect-[16/9] overflow-hidden">
            <Image
              src="/images/book/ZNIEFFb.png"
              alt=""
              fill
              sizes="(min-width: 768px) 36vw, 100vw"
              className="object-contain"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {detailImages.map((image) => (
            <figure
              key={image.src}
              className="overflow-hidden border border-white/12 bg-[#0d3350]/25"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 16vw, 33vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="px-3 py-2 text-xs text-[var(--color-beige)]/75">
                {image.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="rounded-md bg-[var(--color-blue)] px-6 py-2 text-sm font-medium text-[var(--color-beige)] transition hover:bg-[#06324d]"
        >
          {t("next")} &gt;
        </button>
      </div>
    </div>
  );
}

function Amount({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-white/10 bg-black/10 p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-beige)]/55">
        {label}
      </div>
      <div className="mt-1 text-lg tabular-nums text-[var(--color-beige)]">
        {fmtEuro(value)}
      </div>
    </div>
  );
}
