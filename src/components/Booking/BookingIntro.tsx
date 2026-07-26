"use client";

import Image from "next/image";
import DrawerSurface from "@/components/Drawer/DrawerSurface";
import { useT, type TranslationKey } from "@/components/Language/useT";

interface BookingIntroProps {
  /** Element id of the calendar section the "see availability" pill jumps to. */
  calendarAnchorId: string;
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

const COLLAGE = {
  lock: "/images/book/p5 écluse de Penchot.jpeg",
  cruising: "/images/book/p5 coucher.jpg",
  mooring: "/images/book/p5 écluse Roquelongue.jpg",
  river: "/images/book/p5 river.jpg",
  mist: "/images/book/p5 lever.jpg",
  bridge: "/images/book/p5 pont.jpg",
} as const;

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
function CollageSection() {
  return (
    <section className="grid aspect-[1218/1068] grid-rows-[36%_64%] gap-[2px] bg-white">
      <div className="grid grid-cols-3 gap-[2px]">
        <CollageTile
          src={COLLAGE.lock}
          alt="Aerial view of the Penchot lock on the Lot"
          sizes={COLLAGE_THIRD_SIZES}
        />
        <CollageTile
          src={COLLAGE.cruising}
          alt="The Glamping Boat cruising the Lot at sunrise"
          sizes={COLLAGE_THIRD_SIZES}
        />
        <CollageTile
          src={COLLAGE.mooring}
          alt="The Glamping Boat moored on the bank in autumn"
          sizes={COLLAGE_THIRD_SIZES}
        />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-[2px]">
        <CollageTile
          src={COLLAGE.river}
          alt="Wooded hillside mirrored in the still water of the Lot"
          sizes={COLLAGE_LARGE_SIZES}
        />
        <div className="grid grid-rows-2 gap-[2px]">
          <CollageTile
            src={COLLAGE.mist}
            alt="The Glamping Boat at anchor in morning mist"
            sizes={COLLAGE_SIDE_SIZES}
          />
          <CollageTile
            src={COLLAGE.bridge}
            alt="Cast-iron footbridge reflected in the Lot"
            sizes={COLLAGE_SIDE_SIZES}
          />
        </div>
      </div>
    </section>
  );
}

function CollageTile({
  src,
  alt,
  sizes,
}: {
  src: string;
  alt: string;
  sizes: string;
}) {
  return (
    <div className="relative overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        sizes={sizes}
        quality={74}
        className="object-cover"
      />
    </div>
  );
}

/** PDF p.8 — the numbered deck plan. Its legend is light, so it sits on a dark card. */
function PlanSection() {
  const t = useT();

  return (
    <section>
      <div className="overflow-hidden border border-white/12 bg-[rgba(31,61,84,0.84)] p-[clamp(0.6rem,1.6vw,1.6rem)] shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur-sm">
        <div className="relative aspect-[4885/3991] w-full">
          <Image
            src="/images/book/Book.png"
            alt="Deck plan of the Glamping Boat with numbered legend"
            fill
            unoptimized
            sizes={DRAWER_IMAGE_SIZES}
            quality={84}
            className="object-contain"
          />
        </div>

        <p className="mt-[clamp(0.4rem,1vw,0.9rem)] flex items-center gap-3 text-[clamp(0.82rem,1.2vw,1.05rem)] font-light text-[var(--color-beige)]">
          <AccessibilityMark />
          {t("bookIntroPlanAccessible")}
        </p>
      </div>
    </section>
  );
}

function AccessibilityMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7 shrink-0 rounded-full border border-[var(--color-beige)]/70 p-[3px] text-[var(--color-beige)]"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="3.6" r="2" />
      <path
        d="M9.3 7.2h2.4v3.6h4.1a1 1 0 0 1 0 2h-4.1v1.1l3 4.8a1 1 0 0 1-1.7 1.05l-2.9-4.6a3 3 0 0 1-.8-2.05V9a1.8 1.8 0 0 1 0-1.8Z"
        fillRule="evenodd"
      />
      <path
        d="M8.6 11.4a1 1 0 0 1 .5 1.9 3.6 3.6 0 1 0 4.6 4.4 1 1 0 0 1 1.9.55 5.6 5.6 0 1 1-7-6.85Z"
        fillRule="evenodd"
      />
    </svg>
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

export default function BookingIntro({ calendarAnchorId }: BookingIntroProps) {
  const t = useT();

  return (
    <DrawerSurface className="gap-8 overflow-visible !bg-transparent !p-3 !shadow-none !backdrop-blur-0 sm:!p-4">
      {/* Full-bleed within the surface so sections scrolling under it stay legible. */}
      <div className="sticky top-0 z-20 -mx-5 -mb-8 flex justify-end bg-gradient-to-b from-[#0b1e2b]/88 via-[#0b1e2b]/55 to-transparent px-5 pb-10 pt-3 sm:-mx-10 sm:px-10">
        <a
          href={`#${calendarAnchorId}`}
          className="inline-flex items-center bg-[var(--color-blue)] px-[clamp(0.9rem,1.6vw,1.5rem)] py-[clamp(0.45rem,0.8vw,0.7rem)] text-[clamp(0.85rem,1.1vw,1.05rem)] font-light text-[var(--color-beige)] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:bg-[#06324d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/70"
        >
          {t("bookIntroSeeAvailability")}
        </a>
      </div>

      <ValleySection priority />
      <LocationSection />
      <RiverSection />
      <ZnieffSection />
      <CollageSection />
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
    </DrawerSurface>
  );
}
