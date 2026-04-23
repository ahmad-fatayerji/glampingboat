"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { useT } from "@/components/Language/useT";

interface BookingSpecPreviewProps {
  onBack: () => void;
  onContinue: () => void;
}

export default function BookingSpecPreview({
  onBack,
  onContinue,
}: BookingSpecPreviewProps) {
  const t = useT();
  const [slide, setSlide] = useState(0);

  const slides: ReactNode[] = [
    <IntroDescriptionSlide key="intro" />,
    <LotValleySlide key="lot-valley" />,
    <LocationSlide key="location" />,
    <RiverLotSlide key="river-lot" />,
    <ZnieffSlide key="znieff" />,
    <BridgeSlide key="bridge" />,
    <CollageSlide key="collage" />,
    <FloorPlanSlide key="floor-plan" />,
    <InteriorDetailsSlide key="interior" />,
    <BathroomSlide key="bathroom" />,
  ];

  const lastIndex = slides.length - 1;
  const goPrev = () => {
    if (slide === 0) {
      onBack();
      return;
    }
    setSlide((s) => s - 1);
  };
  const goNext = () => {
    if (slide === lastIndex) {
      onContinue();
      return;
    }
    setSlide((s) => s + 1);
  };

  return (
    <div className="relative min-h-[calc(100vh-1.5rem)] w-full overflow-hidden bg-transparent p-3 sm:min-h-[calc(100vh-3rem)] sm:p-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3 text-white sm:p-5">
        <button
          type="button"
          onClick={goPrev}
          aria-label={t("previous")}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center text-5xl font-semibold leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition hover:scale-105"
        >
          &#8249;
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="pointer-events-auto rounded-md bg-[var(--color-blue)] px-4 py-2 text-sm font-medium text-[var(--color-beige)] shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition hover:bg-[#06324d]"
        >
          {t("seeAvailability")}
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label={t("next")}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center text-5xl font-semibold leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition hover:scale-105"
        >
          &#8250;
        </button>
      </div>

      <div className="h-full min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-transparent sm:min-h-[calc(100vh-5rem)]">
        {slides[slide]}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSlide(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`pointer-events-auto h-1.5 w-6 rounded-full transition ${
              idx === slide
                ? "bg-[var(--color-beige)]"
                : "bg-[var(--color-beige)]/30 hover:bg-[var(--color-beige)]/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function SlideFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full min-h-[calc(100vh-4rem)] overflow-hidden border border-white/12 bg-[#0d3350]/25 sm:min-h-[calc(100vh-5rem)]">
      {children}
    </div>
  );
}

function IntroDescriptionSlide() {
  return (
    <SlideFrame>
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[22rem] lg:min-h-0">
          <Image
            src="/images/book/cuisine.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 36vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-col justify-center gap-3 p-6 text-sm leading-relaxed text-[var(--color-beige)]/90">
          <p>
            Step aboard the glampingboat, a simple, lightweight, economical and
            eco-friendly vessel offering a unique river experience, synergies
            of fluvial and terrestrial.
          </p>
          <p>
            The trip offers an immersive experience in the heart of nature, set
            to your own pace with no time constraints. The boat moves slowly
            and is unobtrusive thanks to its electric motor, meaning no
            pollution and no need to refuel.
          </p>
          <p>
            The boat respects the water cycle with a closed-loop system for
            fresh water supply and grey water treatment on board; the boat
            operates sustainably, with no need to top up fresh water or empty
            grey water. Equipped with a glamping tent, you'll enjoy every
            comfort on board.
          </p>
        </div>
      </div>
    </SlideFrame>
  );
}

function LotValleySlide() {
  return (
    <SlideFrame>
      <Image
        src="/images/book/river.jpg"
        alt=""
        fill
        sizes="(min-width: 1024px) 64vw, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div />
        <div>
          <h2 className="max-w-3xl font-serif text-4xl leading-tight text-[var(--color-beige)] md:text-6xl">
            The Lot Valley in Aveyron
          </h2>
          <div className="mt-3 space-y-1 font-serif text-xl text-[var(--color-beige)]/95 md:text-2xl">
            <p>thermalism</p>
            <p>
              ways of Compostela{" "}
              <span className="text-[var(--color-beige)]/80">- GR65</span>
            </p>
            <p>
              the Lot valley by bike{" "}
              <span className="text-[var(--color-beige)]/80">- V86</span>
            </p>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="relative aspect-[16/10] overflow-hidden border border-white/20">
              <Image
                src="/images/book/phealth.png"
                alt=""
                fill
                sizes="20vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[16/10] overflow-hidden border border-white/20">
              <Image
                src="/images/book/gr65.png"
                alt=""
                fill
                sizes="20vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[16/10] overflow-hidden border border-white/20">
              <Image
                src="/images/book/pV86.png"
                alt=""
                fill
                sizes="20vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}

function LocationSlide() {
  return (
    <SlideFrame>
      <div className="grid h-full grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-center gap-2 p-6">
          <p className="font-serif text-3xl text-[var(--color-beige)]">
            France
          </p>
          <p className="font-serif text-3xl text-[var(--color-beige)]">
            Occitanie
          </p>
          <p className="font-serif text-3xl text-[var(--color-beige)]">
            Aveyron
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-[var(--color-beige)] md:text-5xl">
            The Lot Valley in Aveyron
          </h2>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--color-beige)]/85">
            <span>Lot</span>
            <span>Cantal</span>
            <span>Aveyron</span>
            <span>Figeac</span>
            <span>Decazeville</span>
            <span>Villefranche-de-Rouergue</span>
            <span>Rodez</span>
            <span>Aurillac</span>
          </div>
        </div>
        <div className="relative min-h-[22rem] lg:min-h-0">
          <Image
            src="/images/book/cartefrancenav.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 36vw, 100vw"
            className="object-contain p-4"
          />
        </div>
      </div>
    </SlideFrame>
  );
}

function RiverLotSlide() {
  return (
    <SlideFrame>
      <div className="grid h-full grid-cols-1 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col justify-center gap-3 p-6">
          <h2 className="font-serif text-4xl text-[var(--color-beige)] md:text-5xl">
            The river Lot
          </h2>
          <p className="text-xl text-[var(--color-beige)]/95">6 mi stretch</p>
          <p className="text-xl text-[var(--color-beige)]/95">100 Ha</p>
          <p className="text-xl text-[var(--color-beige)]/95">3 river locks</p>
        </div>
        <div className="relative min-h-[22rem] lg:min-h-0">
          <Image
            src="/images/book/plan-eau.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-contain p-4"
          />
        </div>
      </div>
    </SlideFrame>
  );
}

function ZnieffSlide() {
  const species = [
    { src: "/images/book/loutre.jpg", label: "Loutre d'Europe" },
    { src: "/images/book/faucon-pelerin-vol.jpeg", label: "Faucon pelerin" },
    { src: "/images/book/salamandre%20tachet%C3%A9e.jpg", label: "Salamandre" },
    { src: "/images/book/spotted-1472139_1280.jpg", label: "Pic mar" },
    { src: "/images/book/grand%20duc%20d'europe.jpg", label: "Grand-duc" },
  ];
  return (
    <SlideFrame>
      <div className="flex h-full flex-col">
        <div className="px-6 pt-6">
          <h2 className="font-serif text-2xl text-[var(--color-beige)] md:text-3xl">
            National area of natural interest for fauna and flora
          </h2>
        </div>
        <div className="relative flex-1">
          <Image
            src="/images/book/ZNIEFFb.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 64vw, 100vw"
            className="object-contain p-4"
          />
        </div>
        <div className="grid grid-cols-5 gap-1 p-2">
          {species.map((item) => (
            <figure
              key={item.label}
              className="relative aspect-[4/3] overflow-hidden border border-white/15"
            >
              <Image
                src={item.src}
                alt=""
                fill
                sizes="14vw"
                className="object-cover"
              />
            </figure>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}

function BridgeSlide() {
  return (
    <SlideFrame>
      <Image
        src="/images/book/pont.jpg"
        alt=""
        fill
        sizes="(min-width: 1024px) 64vw, 100vw"
        className="object-cover"
      />
    </SlideFrame>
  );
}

function CollageSlide() {
  const photos = [
    "/images/book/%C3%A9cluse%20de%20Penchot.jpeg",
    "/images/book/lever.jpg",
    "/images/book/coucher.jpg",
    "/images/book/river.jpg",
    "/images/book/%C3%A9cluse%20Roquelongue.jpg",
    "/images/book/pont.jpg",
  ];
  return (
    <SlideFrame>
      <div className="grid h-full grid-cols-3 grid-rows-2 gap-1 p-1">
        {photos.map((src, idx) => (
          <div
            key={src}
            className={`relative ${idx === 3 ? "col-span-2" : ""}`}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 1024px) 22vw, 33vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

function FloorPlanSlide() {
  const legend = [
    "1 Access gate to the control bridge",
    "2 Steering position",
    "3 Lifebuoy and fire extinguisher",
    "4 The deck",
    "5 Kitchenette",
    "6 Manual marine toilet and deck shower",
    "7d Double bed (140 x 190 cm)",
    "7s Single bunk beds (80 x 190 cm)",
    "8 Control bridge",
    "9 Boarding ladder",
    "10 Hammock",
  ];
  return (
    <SlideFrame>
      <div className="flex h-full flex-col p-4">
        <div className="relative flex-1">
          <Image
            src="/images/book/Image1.png"
            alt="Glamping boat floor plan"
            fill
            sizes="(min-width: 1024px) 64vw, 100vw"
            className="object-contain"
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-[var(--color-beige)]/85 md:grid-cols-3">
          {legend.map((line) => (
            <div key={line}>{line}</div>
          ))}
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6">
              <Image
                src="/images/book/handi.png"
                alt=""
                fill
                sizes="24px"
                className="object-contain"
              />
            </div>
            <span>Accessible to people with disabilities</span>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}

function InteriorDetailsSlide() {
  return (
    <SlideFrame>
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[22rem] lg:min-h-0">
          <Image
            src="/images/book/chambre.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 36vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-3 overflow-y-auto p-6 text-xs leading-relaxed text-[var(--color-beige)]/90">
          <div>
            <p className="font-medium text-[var(--color-beige)]">
              Sleeping area
            </p>
            <p>
              Double bed 140 x 190 cm and two bunk beds 80 x 190 cm. Foam
              mattresses with protective covers. A rechargeable portable LED
              lamp. Towels not provided - bed linen available as an option.
            </p>
          </div>
          <div>
            <p className="font-medium text-[var(--color-beige)]">Saloon</p>
            <p>
              Wooden tabletop and four chairs. One rechargeable portable LED
              lamp.
            </p>
          </div>
          <div>
            <p className="font-medium text-[var(--color-beige)]">Wheelhouse</p>
            <p>
              Wooden steering wheel, electric motor remote and battery monitor,
              shore power socket, 4 x USB ports for charging the portable LED
              lamps. Fitted and equipped for safe navigation.
            </p>
          </div>
          <div>
            <p className="font-medium text-[var(--color-beige)]">Kitchenette</p>
            <p>
              60 x 200 cm with single-bowl sink with timed hot water, two-burner
              gas hob, high-end electric cooler, crockery and cutlery for four.
              10 L insulated drinking water dispenser with tap. A rechargeable
              portable LED lamp.
            </p>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}

function BathroomSlide() {
  return (
    <SlideFrame>
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[22rem] lg:min-h-0">
          <Image
            src="/images/book/wc.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 36vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-3 overflow-y-auto p-6 text-xs leading-relaxed text-[var(--color-beige)]/90">
          <div>
            <p className="font-medium text-[var(--color-beige)]">Bathroom</p>
            <p>
              90 x 200 cm with a manual marine toilet and a deck shower with a
              hot-water timer. A rechargeable portable LED lamp. Instant gas
              water heater with temperature control.
            </p>
            <p className="mt-2">
              The water available at the sink and in the shower is adjustable
              hot water - not drinkable, intended for washing up and personal
              hygiene. Toilet paper provided. Outdoor Pharmavoyage liquid soap
              for washing up, cleaning and personal hygiene provided. Do not
              use any products other than those provided on board.
            </p>
          </div>
          <div>
            <p className="font-medium text-[var(--color-beige)]">Aft deck</p>
            <p>Boarding ladder and support bar with hammock.</p>
          </div>
          <p className="italic text-[var(--color-beige)]/75">
            The boat is equipped with an on-board biological water treatment
            plant that does not use chlorine. To ensure the system's daily
            treatment capacity, keep water consumption on board to a strict
            minimum and use non-biocidal hygiene products. Please inform us at
            the time of booking if you are taking any antibiotics.
          </p>
        </div>
      </div>
    </SlideFrame>
  );
}
