"use client";

import Image from "next/image";
import DrawerSurface from "@/components/Drawer/DrawerSurface";
import { useT } from "@/components/Language/useT";

const BUY_IMAGE_SIZES =
  "(min-width: 1280px) 42vw, (min-width: 1024px) 48vw, (min-width: 640px) 58vw, 100vw";

const benefits = [
  "Silent electric propulsion",
  "Zero direct emissions",
  "Smooth and eco-friendly cruising",
  "Ideal for rivers, canals and calm waters",
];

const specs = [
  ["Length", "8.00 m"],
  ["Width", "4.30 m"],
  ["Weight max", "2,995 kg"],
  ["Draft", "0.35 m"],
  ["Height", "3.76 m, adjustable depending on the site"],
  ["Design category", "D"],
  ["Capacity", "4 people"],
  ["Propulsion", "Electric"],
  ["Installed power", "4.3 kW"],
];

const packages = [
  {
    title: "Glamping Boat",
    image: "/images/buy/glamping boat.png",
    alt: "Glamping Boat side elevation with lodge tent, furniture and motor",
    features: [
      "Power boat",
      "Portable battery",
      "Electric motor",
      "Lodge tent",
      "Living area and table",
      "Wooden bed frame and mattress",
      "Wooden kitchenette units",
      "Sink and kitchenette equipment",
      "Water treatment plants",
      "Shower and toilet",
    ],
  },
  {
    title: "Day boat",
    image: "/images/buy/day boat.png",
    alt: "Day boat side elevation with tent and deck equipment",
    features: [
      "Power boat",
      "Portable battery",
      "Electric motor",
      "Tent and furniture",
    ],
  },
  {
    title: "Lodge",
    image: "/images/buy/Lodge.png",
    alt: "Lodge tent side elevation on a floating pontoon",
    features: [
      "Floating pontoon",
      "Lodge tent",
      "Table and chairs",
      "Wooden bed frame and mattress",
      "Kitchenette units",
    ],
    optionalFeatures: [
      "Water treatment plants",
      "Shower and toilet",
      "Sink and kitchenette equipment",
    ],
  },
  {
    title: "Pontoon",
    image: "/images/buy/pontoon.png",
    alt: "Pontoon side elevation with electric motor and railing",
    features: ["Power boat", "Portable battery", "Electric motor", "Railing"],
  },
];

const reasons = [
  "Eco-friendly and cost-effective",
  "Easy to operate",
  "Perfect for river tourism",
  "A unique glamping concept on the water",
  "Ideal for personal use or as a rental investment",
];

const audiences = [
  "Individuals looking to get away from it all",
  "Tourism professionals, holiday cottages, water sports centres and rental companies",
];

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="button-arrow-icon h-4 w-4 shrink-0"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 10H15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M10 5L15 10L10 15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function WaveMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 74 18"
      className="h-5 w-20 text-[var(--color-beige)] sm:w-24"
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

export default function BuyDrawer({
  onBookClick,
  onContactClick,
}: {
  onBookClick: () => void;
  onContactClick: () => void;
}) {
  const t = useT();

  return (
    <DrawerSurface className="gap-8 overflow-hidden !bg-transparent !shadow-none !backdrop-blur-0">
      <header className="grid gap-5 border-b border-white/15 pb-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div className="relative min-h-[21rem] overflow-hidden rounded-lg bg-[var(--color-blue)] sm:min-h-[25rem]">
          <Image
            src="/images/buy/pv2.jpg"
            alt="Aerial view of the Glamping Boat cruising on calm water"
            fill
            sizes={BUY_IMAGE_SIZES}
            priority
            quality={75}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#002038]/82 via-[#002038]/12 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-5 py-5 sm:px-7 sm:py-7">
            <p className="mb-2 text-xs uppercase tracking-[0.28em] text-[var(--color-beige)]/72">
              {t("buy")}
            </p>
            <h2 className="max-w-2xl text-3xl font-semibold leading-[1.05] text-[var(--color-beige)] sm:text-5xl">
              The new-generation electric river boat
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--color-beige)]/86 sm:text-lg">
              The different way of slow tourism.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 bg-[#2f4858]/78 p-5 text-[var(--color-beige)] sm:p-7">
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-[var(--color-beige)]/88">
              With Glamping Boat, step into a new era of travel: quiet,
              self-sufficient, eco-friendly and comfortable. Designed for river
              glamping, this boat combines optimised design, ease of use and
              total immersion in nature.
            </p>
            <div>
              <p className="text-2xl font-semibold leading-tight">
                100% electric,
                <br />
                100% freedom
              </p>
              <ul className="mt-5 space-y-2 text-[var(--color-beige)]/82">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3">
                    <span className="mt-2 h-px w-7 bg-[var(--color-beige)]/70" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            type="button"
            onClick={onContactClick}
            className="inline-flex w-fit items-center gap-2 rounded-md bg-[var(--color-blue)] px-4 py-2 font-semibold text-[var(--color-beige)] transition hover:bg-[#0b314b]"
          >
            <span>contact us</span>
            <ArrowIcon />
          </button>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.72fr)]">
        <div className="relative min-h-[24rem] overflow-hidden rounded-lg bg-[rgba(228,219,206,0.38)] backdrop-blur-[1px] sm:min-h-[32rem]">
          <Image
            src="/images/buy/plan b.png"
            alt="Technical plan of the Glamping Boat with side and front elevations"
            fill
            unoptimized
            sizes={BUY_IMAGE_SIZES}
            className="object-contain p-4 opacity-70 mix-blend-screen"
          />
        </div>

        <div className="bg-[#2f4858]/78 p-5 sm:p-7">
          <p className="text-3xl font-light leading-none text-[var(--color-beige)]">
            Glamping Boat
            <sup className="ml-1 text-sm">TM</sup>
          </p>
          <h3 className="mt-8 text-xl font-semibold">
            Technical specifications
          </h3>
          <dl className="mt-5 space-y-4">
            {specs.map(([label, value]) => (
              <div key={label} className="border-b border-white/12 pb-3">
                <dt className="text-xs uppercase tracking-[0.18em] text-[var(--color-beige)]/58">
                  {label}
                </dt>
                <dd className="mt-1 text-lg leading-snug text-[var(--color-beige)]/92">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="relative overflow-hidden bg-transparent">
        <div className="absolute inset-0 bg-[rgba(228,219,206,0.34)]" />

        <div className="relative grid lg:grid-cols-[minmax(0,1.5fr)_minmax(22rem,0.95fr)]">
          <div className="flex flex-col px-4 py-7 sm:px-7 lg:pr-0">
            {packages.map((item, index) => (
              <div
                key={item.title}
                className={`grid items-center gap-3 sm:grid-cols-[minmax(13rem,1fr)_11rem_5.5rem] ${
                  index === 0
                    ? "min-h-[17rem]"
                    : index === 2
                      ? "min-h-[14rem]"
                      : "min-h-[11.5rem]"
                }`}
              >
                <div className="relative h-28 sm:h-[8.5rem] lg:h-36">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 32vw, (min-width: 640px) 46vw, 88vw"
                    className="object-contain object-left"
                  />
                </div>
                <p
                  className="text-4xl font-black leading-none text-[var(--color-blue)] sm:text-right sm:text-5xl"
                  style={{
                    fontFamily:
                      '"Brush Script MT", "Segoe Script", "Apple Chancery", cursive',
                  }}
                >
                  {item.title}
                </p>
                <div className="hidden justify-center sm:flex">
                  <WaveMark />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col bg-[#2f4858]/88 px-5 py-7 sm:px-8">
            <button
              type="button"
              onClick={onContactClick}
              className="mb-3 inline-flex w-fit items-center gap-2 rounded-md bg-[var(--color-blue)] px-4 py-2 text-xl font-semibold leading-none text-[var(--color-beige)] transition hover:bg-[#0b314b]"
            >
              <span>contact us</span>
              <ArrowIcon />
            </button>

            {packages.map((item, index) => (
              <div
                key={item.title}
                className={`flex flex-col justify-center py-3 text-[1.15rem] font-semibold leading-[1.18] text-[var(--color-beige)] sm:text-[1.28rem] ${
                  index === 0
                    ? "min-h-[15rem]"
                    : index === 2
                      ? "min-h-[14rem]"
                      : "min-h-[11.5rem]"
                }`}
              >
                <ul>
                  {item.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                {"optionalFeatures" in item && item.optionalFeatures ? (
                  <div className="mt-1 text-base font-normal italic leading-tight text-[var(--color-beige)]/88 sm:text-lg">
                    <p>Options:</p>
                    <ul>
                      {item.optionalFeatures.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.78fr)]">
        <div className="relative min-h-[24rem] overflow-hidden rounded-lg bg-[var(--color-blue)]">
          <Image
            src="/images/buy/pv1.jpg"
            alt="Glamping Boat seen from above with a white lodge tent on the river"
            fill
            sizes={BUY_IMAGE_SIZES}
            quality={75}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[rgba(228,219,206,0.58)]" />
          <div className="relative grid min-h-[24rem] content-center gap-7 p-5 text-[var(--color-blue)] sm:p-8">
            <div>
              <h3 className="text-3xl font-semibold leading-tight">
                Why choose Glamping Boat?
              </h3>
              <ul className="mt-5 space-y-2 text-lg font-semibold leading-snug">
                {reasons.map((reason) => (
                  <li key={reason} className="flex gap-3">
                    <span aria-hidden="true">/</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-3xl font-semibold leading-tight">
                Who is it for?
              </h3>
              <ul className="mt-5 space-y-2 text-lg font-semibold leading-snug">
                {audiences.map((audience) => (
                  <li key={audience} className="flex gap-3">
                    <span aria-hidden="true">/</span>
                    <span>{audience}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="flex flex-col justify-between gap-8 bg-[#2f4858]/82 p-5 sm:p-7">
          <div className="space-y-5">
            <h3 className="text-3xl font-semibold leading-tight">
              Fancy embarking on the Glamping Boat adventure?
            </h3>
            <p className="text-xl font-semibold leading-relaxed text-[var(--color-beige)]/92">
              Contact us to receive your personalised quote and discover the
              available options.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onContactClick}
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-beige)] px-4 py-2 font-semibold text-[var(--color-blue)] transition hover:bg-[#efe6d9]"
            >
              <span>request a quote</span>
              <ArrowIcon />
            </button>
            <button
              type="button"
              onClick={onBookClick}
              className="inline-flex items-center gap-2 rounded-md border border-[var(--color-beige)]/35 px-4 py-2 font-semibold transition hover:bg-white/8"
            >
              <span>{t("book")}</span>
              <ArrowIcon />
            </button>
          </div>
        </aside>
      </section>
    </DrawerSurface>
  );
}
