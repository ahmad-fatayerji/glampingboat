"use client";

import Image from "next/image";
import { useState } from "react";
import DrawerSurface from "@/components/Drawer/DrawerSurface";
import ImageViewer from "@/components/Gallery/ImageViewer";
import Drop from "@/components/NavBox/Drop";
import { useT, type TranslationKey } from "@/components/Language/useT";

interface BookingIntroProps {
  /** Element id of the calendar section the "see availability" pill jumps to. */
  calendarAnchorId: string;
  /** When false, the "see availability" pill renders disabled with a tooltip. */
  bookingEnabled?: boolean;
}

const DRAWER_IMAGE_SIZES =
  "(min-width: 1280px) 64vw, (min-width: 1024px) 72vw, (min-width: 640px) 82vw, 100vw";
const COLLAGE_THIRD_SIZES =
  "(min-width: 1280px) 21vw, (min-width: 1024px) 24vw, (min-width: 640px) 28vw, 33vw";
const COLLAGE_LARGE_SIZES =
  "(min-width: 1280px) 43vw, (min-width: 1024px) 48vw, (min-width: 640px) 55vw, 67vw";
const COLLAGE_SIDE_SIZES =
  "(min-width: 1280px) 21vw, (min-width: 1024px) 24vw, (min-width: 640px) 27vw, 33vw";
const SPLIT_IMAGE_SIZES =
  "(min-width: 1280px) 32vw, (min-width: 1024px) 36vw, (min-width: 640px) 41vw, 100vw";

/** Fraction of Book.png above its baked-in English legend, which we re-render as text. */
const PLAN_CROP = 0.71;
const PLAN_WIDTH = 4885;
const PLAN_HEIGHT = 3991;

/** Collage frames in the order the PDF assembles them; also the viewer's order. */
const COLLAGE_IMAGES: {
  src: string;
  alt: string;
  labelKey: TranslationKey;
}[] = [
  {
    src: "/images/book/p5 écluse de Penchot.jpeg",
    alt: "Aerial view of the Penchot lock on the Lot",
    labelKey: "bookIntroPhotoLock",
  },
  {
    src: "/images/book/p5 coucher.jpg",
    alt: "The Glamping Boat cruising the Lot at sunrise",
    labelKey: "bookIntroPhotoCruising",
  },
  {
    src: "/images/book/p5 écluse Roquelongue.jpg",
    alt: "The Glamping Boat moored on the bank in autumn",
    labelKey: "bookIntroPhotoMooring",
  },
  {
    src: "/images/book/p5 river.jpg",
    alt: "Wooded hillside mirrored in the still water of the Lot",
    labelKey: "bookIntroPhotoRiver",
  },
  {
    src: "/images/book/p5 lever.jpg",
    alt: "The Glamping Boat at anchor in morning mist",
    labelKey: "bookIntroPhotoMist",
  },
  {
    src: "/images/book/p5 pont.jpg",
    alt: "Cast-iron footbridge reflected in the Lot",
    labelKey: "bookIntroPhotoBridge",
  },
];

/** Numbered markers on the deck plan, matching the droplets drawn on Book.png. */
const PLAN_LEGEND: { marker: string; key: TranslationKey }[] = [
  { marker: "1", key: "bookPlanAccessGate" },
  { marker: "2", key: "bookPlanSteering" },
  { marker: "3", key: "bookPlanLifebuoy" },
  { marker: "4", key: "bookPlanDeck" },
  { marker: "5", key: "bookPlanKitchenette" },
  { marker: "6", key: "bookPlanToilet" },
  { marker: "7d", key: "bookPlanDoubleBed" },
  { marker: "7s", key: "bookPlanBunkBeds" },
  { marker: "8", key: "bookPlanControlBridge" },
  { marker: "9", key: "bookPlanLadder" },
  { marker: "10", key: "bookPlanHammock" },
];

/** Splits a dictionary value on newlines into one paragraph per line. */
function Lines({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text.split("\n").map((line) => (
        <p key={line} className={className}>
          {line}
        </p>
      ))}
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-[clamp(0.6rem,1.4vw,1.1rem)] text-[clamp(1.5rem,3.4vw,2.9rem)] font-light leading-[1.05] text-[var(--color-beige)] drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
      {children}
    </h2>
  );
}

/** PDF p.1 — the destination, with the thermalism / GR65 / V86 strap over the hero. */
function ValleySection({ priority }: { priority: boolean }) {
  const t = useT();

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative aspect-[1225/1066] w-full">
        <Image
          src="/images/book/p1.png"
          alt="The Lot valley in Aveyron seen from the water, with thermal baths, the GR65 pilgrim way and the V86 cycle route"
          fill
          unoptimized
          sizes={DRAWER_IMAGE_SIZES}
          priority={priority}
          quality={80}
          className="object-cover"
        />

        <div className="pointer-events-none absolute inset-x-[4%] bottom-[29%] text-right text-[var(--color-beige)] drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
          <h2 className="text-[clamp(1.6rem,5.2vw,4.4rem)] font-light leading-none">
            {t("bookIntroValleyTitle")}
          </h2>
          <p className="mt-[0.14em] text-[clamp(1rem,3vw,2.5rem)] font-light leading-[1.14]">
            {t("bookIntroValleyThermalism")}
          </p>
          <p className="text-[clamp(1rem,3vw,2.5rem)] font-light leading-[1.14]">
            {t("bookIntroValleyCompostela")}
            <span className="text-[0.62em]"> &ndash; GR65</span>
          </p>
          <p className="text-[clamp(1rem,3vw,2.5rem)] font-light leading-[1.14]">
            {t("bookIntroValleyBike")}
            <span className="text-[0.62em]"> &ndash; V86</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/** PDF p.2 — where the Lot valley sits in France. Transparent artwork, so it needs a card. */
function LocationSection() {
  const t = useT();

  return (
    <section>
      <SectionTitle>{t("bookIntroValleyTitle")}</SectionTitle>
      <div className="overflow-hidden border border-white/12 bg-[#6f8593]/88 p-[clamp(0.6rem,1.6vw,1.6rem)] shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur-sm">
        <div className="relative aspect-[1336/960] w-full">
          <Image
            src="/images/book/p2.png"
            alt="Map of France locating the Lot valley in Occitanie, Aveyron, between Figeac, Decazeville, Villefranche-de-Rouergue, Rodez and Aurillac"
            fill
            unoptimized
            sizes={DRAWER_IMAGE_SIZES}
            quality={82}
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
}

/** PDF p.3 — the navigable stretch, titled over the light map as in the deck. */
function RiverSection() {
  const t = useT();

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative aspect-[1216/909] w-full">
        <Image
          src="/images/book/p3.png"
          alt="Map of the navigable Lot between Boisse-Penchot, Livinhac-le-haut, Flagnac and Saint-Parthem"
          fill
          unoptimized
          sizes={DRAWER_IMAGE_SIZES}
          quality={82}
          className="object-cover"
        />

        <div className="pointer-events-none absolute inset-x-[4%] top-[6%] text-[#1f3d54]">
          <h2 className="text-[clamp(1.5rem,4.4vw,3.7rem)] font-light leading-none">
            {t("bookIntroRiverTitle")}
          </h2>
          <p className="mt-[0.18em] text-[clamp(1rem,2.8vw,2.3rem)] font-light leading-[1.2]">
            {t("bookIntroRiverStretch")}
          </p>
          <p className="text-[clamp(1rem,2.8vw,2.3rem)] font-light leading-[1.2]">
            {t("bookIntroRiverArea")}
          </p>
          <p className="text-[clamp(1rem,2.8vw,2.3rem)] font-light leading-[1.2]">
            {t("bookIntroRiverLocks")}
          </p>
        </div>
      </div>
    </section>
  );
}

/** PDF p.4 — the ZNIEFF plate. Navy line art on transparency, so it sits on a beige card. */
function ZnieffSection() {
  const t = useT();

  return (
    <section>
      <SectionTitle>{t("bookIntroZnieffTitle")}</SectionTitle>
      <div className="overflow-hidden border border-white/12 bg-[var(--color-beige)] p-[clamp(0.6rem,1.6vw,1.6rem)] shadow-[0_18px_55px_rgba(0,0,0,0.28)]">
        <div className="relative aspect-[1230/946] w-full">
          <Image
            src="/images/book/p4.png"
            alt="ZNIEFF plate of the protected species of the Lot valley: otter, peregrine falcon, fire salamander, middle spotted woodpecker and eagle owl"
            fill
            unoptimized
            sizes={DRAWER_IMAGE_SIZES}
            quality={82}
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
}

/** PDF p.5/6 — the photo assembly, rebuilt from the source frames so it reflows. */
function CollageSection({ onOpen }: { onOpen: (index: number) => void }) {
  return (
    <section className="grid aspect-[1218/1068] grid-rows-[36%_64%] gap-[2px] bg-white">
      <div className="grid grid-cols-3 gap-[2px]">
        <CollageTile index={0} sizes={COLLAGE_THIRD_SIZES} onOpen={onOpen} />
        <CollageTile index={1} sizes={COLLAGE_THIRD_SIZES} onOpen={onOpen} />
        <CollageTile index={2} sizes={COLLAGE_THIRD_SIZES} onOpen={onOpen} />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-[2px]">
        <CollageTile index={3} sizes={COLLAGE_LARGE_SIZES} onOpen={onOpen} />
        <div className="grid grid-rows-2 gap-[2px]">
          <CollageTile index={4} sizes={COLLAGE_SIDE_SIZES} onOpen={onOpen} />
          <CollageTile index={5} sizes={COLLAGE_SIDE_SIZES} onOpen={onOpen} />
        </div>
      </div>
    </section>
  );
}

function CollageTile({
  index,
  sizes,
  onOpen,
}: {
  index: number;
  sizes: string;
  onOpen: (index: number) => void;
}) {
  const { src, alt } = COLLAGE_IMAGES[index];

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      aria-label={`Open ${alt}`}
      className="group relative overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/80"
    >
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        sizes={sizes}
        quality={74}
        className="object-cover transition duration-300 group-hover:scale-[1.025] group-hover:opacity-90"
      />
      <span className="pointer-events-none absolute inset-0 bg-[var(--color-blue)]/0 transition group-hover:bg-[var(--color-blue)]/12" />
    </button>
  );
}

/**
 * PDF p.8 — the numbered deck plan. Book.png ships with an English legend baked
 * in, so we clip it off and re-render the labels from the dictionary instead.
 */
function PlanSection() {
  const t = useT();

  return (
    <section>
      <div className="overflow-hidden border border-white/12 bg-[rgba(31,61,84,0.84)] p-[clamp(0.6rem,1.6vw,1.6rem)] shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur-sm">
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: `${PLAN_WIDTH} / ${PLAN_HEIGHT * PLAN_CROP}` }}
        >
          <div
            className="absolute inset-x-0 top-0"
            style={{ aspectRatio: `${PLAN_WIDTH} / ${PLAN_HEIGHT}` }}
          >
            <Image
              src="/images/book/Book.png"
              alt="Deck plan of the Glamping Boat with numbered markers"
              fill
              unoptimized
              sizes={DRAWER_IMAGE_SIZES}
              quality={84}
              className="object-contain"
            />
          </div>
        </div>

        <ul className="mt-[clamp(0.7rem,1.6vw,1.4rem)] grid gap-x-[clamp(0.8rem,2vw,2rem)] gap-y-[clamp(0.35rem,0.8vw,0.6rem)] sm:grid-cols-2 lg:grid-cols-3">
          {PLAN_LEGEND.map(({ marker, key }) => (
            <li key={marker} className="flex items-center gap-2">
              <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center">
                <Drop
                  className="absolute inset-0 h-full w-full"
                  style={{ stroke: "var(--color-beige)" }}
                />
                <span className="relative pt-[0.35em] text-[0.62rem] font-light leading-none text-[var(--color-beige)]">
                  {marker}
                </span>
              </span>
              <span className="min-w-0 text-[clamp(0.78rem,1.05vw,0.98rem)] font-light leading-tight text-[var(--color-beige)]">
                {t(key)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** PDF p.9–11 — a frame from on board beside the matching equipment copy. */
function DetailSection({
  src,
  alt,
  bodyKeys,
  noteKey,
}: {
  src: string;
  alt: string;
  bodyKeys: TranslationKey[];
  noteKey?: TranslationKey;
}) {
  const t = useT();

  return (
    <section className="grid gap-[2px] bg-white/5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="relative aspect-[740/1065] w-full overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes={SPLIT_IMAGE_SIZES}
          quality={80}
          className="object-cover"
        />
      </div>

      <div className="flex flex-col justify-center gap-[clamp(0.7rem,1.6vw,1.4rem)] bg-[rgba(31,61,84,0.84)] px-[clamp(1rem,2.2vw,2.2rem)] py-[clamp(1.1rem,2.4vw,2.4rem)] text-[var(--color-beige)] backdrop-blur-sm">
        {bodyKeys.map((key) => (
          <div key={key}>
            <Lines
              text={t(key)}
              className="text-[clamp(0.85rem,1.15vw,1.1rem)] font-light leading-[1.5]"
            />
          </div>
        ))}

        {noteKey ? (
          <p className="border-t border-[var(--color-beige)]/22 pt-[clamp(0.6rem,1.4vw,1.2rem)] text-[clamp(0.8rem,1.05vw,1rem)] font-light italic leading-[1.5] text-[var(--color-beige)]/88">
            {t(noteKey)}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default function BookingIntro({
  calendarAnchorId,
  bookingEnabled = true,
}: BookingIntroProps) {
  const t = useT();
  const [activeImage, setActiveImage] = useState<number | null>(null);

  const viewerImages = COLLAGE_IMAGES.map(({ src, alt, labelKey }) => ({
    src,
    alt,
    label: t(labelKey),
  }));

  return (
    <DrawerSurface className="gap-8 overflow-visible !bg-transparent !p-3 !shadow-none !backdrop-blur-0 sm:!p-4">
      <div className="sticky top-0 z-20 -mx-5 -mb-8 flex h-0 items-start justify-end overflow-visible px-5 sm:-mx-10 sm:px-10">
        {bookingEnabled ? (
          <a
            href={`#${calendarAnchorId}`}
            className="mt-3 inline-flex items-center bg-[var(--color-blue)] px-[clamp(0.9rem,1.6vw,1.5rem)] py-[clamp(0.45rem,0.8vw,0.7rem)] text-[clamp(0.85rem,1.1vw,1.05rem)] font-light text-[var(--color-beige)] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:bg-[#06324d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/70"
          >
            {t("bookIntroSeeAvailability")}
          </a>
        ) : (
          <span
            role="link"
            aria-disabled="true"
            className="group relative mt-3 inline-flex cursor-not-allowed items-center bg-[var(--color-blue)]/45 px-[clamp(0.9rem,1.6vw,1.5rem)] py-[clamp(0.45rem,0.8vw,0.7rem)] text-[clamp(0.85rem,1.1vw,1.05rem)] font-light text-[var(--color-beige)]/60 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
          >
            {t("bookIntroSeeAvailability")}
            <span className="pointer-events-none absolute right-0 top-full z-30 mt-2 w-max max-w-[14rem] whitespace-normal rounded-md bg-[#0b1e2b] px-3 py-2 text-xs font-normal text-[var(--color-beige)] opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition group-hover:opacity-100">
              {t("bookIntroUnavailableTooltip")}
            </span>
          </span>
        )}
      </div>

      <ValleySection priority />
      <LocationSection />
      <RiverSection />
      <ZnieffSection />
      <CollageSection onOpen={setActiveImage} />
      <PlanSection />

      <DetailSection
        src="/images/book/p6.png"
        alt="The galley worktop on board the Glamping Boat"
        bodyKeys={["bookIntroAboard"]}
      />
      <DetailSection
        src="/images/book/p7.png"
        alt="A guest reading with a child on the double bed on board"
        bodyKeys={["bookIntroSleeping", "bookIntroSaloon", "bookIntroKitchen"]}
      />
      <DetailSection
        src="/images/book/p8.png"
        alt="The on-board bathroom with marine toilet and deck shower"
        bodyKeys={["bookIntroBathroom", "bookIntroHygiene", "bookIntroDeck"]}
        noteKey="bookIntroWaterNote"
      />

      <ImageViewer
        images={viewerImages}
        activeIndex={activeImage}
        onClose={() => setActiveImage(null)}
        onSelect={setActiveImage}
      />
    </DrawerSurface>
  );
}
