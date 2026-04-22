"use client";

import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { AudioToggle } from "@/components/Audio/AudioToggle";
import BoatSlideshow, { type BoatSlide } from "@/components/Boat/BoatSlideshow";
import BookingForm from "@/components/Booking/BookingForm";
import ContactForm from "@/components/Contact/ContactForm";
import BuyDrawer from "@/components/Drawer/BuyDrawer";
import DrawerSurface from "@/components/Drawer/DrawerSurface";
import LegalTextDrawer from "@/components/Drawer/LegalTextDrawer";
import VisionDrawer from "@/components/Drawer/VisionDrawer";
import { useT } from "@/components/Language/useT";
import LegalNoticesDrawer from "@/components/Legal/LegalNoticesDrawer";
import MonthCalendar from "@/components/MonthCalendar";
import NavBox from "@/components/NavBox/NavBox";
import WaveToggle from "@/components/NavBox/WaveToggle";

interface AppShellProps {
  children: ReactNode;
  serverToday: string;
}

type Stage =
  | "vision"
  | "boat"
  | "calendar"
  | "form"
  | "buy"
  | "contact"
  | "legal"
  | "cookies"
  | "terms";

const BOAT_SLIDES: BoatSlide[] = [
  {
    src: "/images/boat/optimized/Shotcut_00_00_03_987a.webp",
    alt: "Boat interior dining area",
    label: "Living area",
  },
  {
    src: "/images/boat/optimized/Shotcut_00_00_03_987b.webp",
    alt: "Boat sleeping quarters",
    label: "Sleeping quarters",
  },
  {
    src: "/images/boat/optimized/Shotcut_00_00_03_987c.webp",
    alt: "Boat kitchenette",
    label: "Kitchenette",
  },
  {
    src: "/images/boat/optimized/Shotcut_00_00_03_987d.webp",
    alt: "Boat deck exterior",
    label: "Deck",
  },
  {
    src: "/images/boat/optimized/Shotcut_00_00_03_987e.webp",
    alt: "Boat bathroom area",
    label: "Sanitary facilities",
  },
  {
    src: "/images/boat/optimized/Shotcut_00_00_03_987f.webp",
    alt: "Boat cabin view",
    label: "Cabin details",
  },
  {
    src: "/images/boat/optimized/Shotcut_00_00_03_987g.webp",
    alt: "Boat exterior on the water",
    label: "Exterior",
  },
  {
    src: "/images/boat/optimized/plan 3d couleur.webp",
    alt: "Boat floor plan",
    label: "3D plan",
  },
];

export default function AppShell({ children, serverToday }: AppShellProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("calendar");
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const t = useT();
  const { data: session } = useSession();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.dataset.drawer = drawerOpen ? "open" : "closed";
    document.documentElement.dataset.drawerStage = drawerOpen ? stage : "closed";
  }, [drawerOpen, stage]);

  const openStage = (nextStage: Stage) => {
    if (drawerOpen && stage === nextStage) {
      setDrawerOpen(false);
      return;
    }

    setStage(nextStage);
    setDrawerOpen(true);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;

    if (dx > 60 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      setDrawerOpen(false);
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleBookClick = () => {
    if (drawerOpen && stage === "calendar") {
      setDrawerOpen(false);
      return;
    }

    setStage("calendar");
    setRangeStart(null);
    setRangeEnd(null);
    setDrawerOpen(true);
  };

  const handleRangeSelect = (start: Date, end: Date) => {
    if (!session) {
      window.location.href = "/account";
      return;
    }

    setRangeStart(start);
    setRangeEnd(end);
  };

  const handleNext = () => {
    if (!session) {
      window.location.href = "/account";
      return;
    }

    setStage("form");
  };

  const activeMenuItem =
    drawerOpen && stage === "vision"
      ? "ourVision"
      : drawerOpen && stage === "boat"
        ? "boat"
        : drawerOpen && (stage === "calendar" || stage === "form")
          ? "book"
          : drawerOpen && stage === "buy"
            ? "buy"
            : drawerOpen && stage === "contact"
              ? "contact"
              : null;

  return (
    <>
      <AudioToggle />
      <WaveToggle open={navOpen} toggle={() => setNavOpen((open) => !open)} />

      <div
        className={`fixed bottom-4 left-4 z-40 transform transition-transform duration-300 ease-in-out ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavBox
          onVisionClick={() => openStage("vision")}
          onBookClick={handleBookClick}
          onBoatClick={() => openStage("boat")}
          onBuyClick={() => openStage("buy")}
          onContactClick={() => openStage("contact")}
          onLegalClick={() => openStage("legal")}
          onCookiesClick={() => openStage("cookies")}
          onTermsClick={() => openStage("terms")}
          activeItem={activeMenuItem}
        />
      </div>

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-transparent p-0 text-gray-100 transition-transform duration-300 ease-in-out sm:w-[82vw] lg:w-[72vw] xl:w-[64vw] ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {stage === "vision" && (
          <VisionDrawer onClose={() => setDrawerOpen(false)} />
        )}

        {stage === "boat" && (
          <BoatSlideshow
            slides={BOAT_SLIDES}
            onClose={() => setDrawerOpen(false)}
          />
        )}

        {stage === "calendar" && (
          <DrawerSurface>
            {!session && (
              <div className="mb-4 rounded-xl border border-[var(--color-blue)]/10 bg-[var(--color-beige)]/80 p-4 text-sm leading-relaxed text-[var(--color-blue)]">
                <p className="mb-1 font-medium">
                  {t("bookingSignInRequiredTitle")}
                </p>
                <p className="mb-3 opacity-80">
                  {t("bookingSignInRequiredBody")}
                </p>
                <a
                  href="/account"
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--color-blue)] px-4 py-1.5 text-xs font-semibold tracking-wide text-[var(--color-beige)] transition hover:bg-[#06324d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)]/40 focus-visible:ring-offset-2"
                >
                  {t("goToAccount")} &rarr;
                </a>
              </div>
            )}
            <MonthCalendar
              availableDates={Array.from({ length: 31 }, (_, index) => index + 1)}
              serverToday={serverToday}
              onSelectRange={handleRangeSelect}
            />
            {rangeStart && rangeEnd && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm">
                  <p>
                    {t("arrival")}: {rangeStart.toLocaleDateString()}
                  </p>
                  <p>
                    {t("departure")}: {rangeEnd.toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-blue)] px-6 py-2 font-semibold text-[var(--color-beige)] transition hover:bg-[#06324d]"
                >
                  <span>{t("next")}</span>
                  <span>&rarr;</span>
                </button>
              </div>
            )}
          </DrawerSurface>
        )}

        {stage === "form" && rangeStart && rangeEnd && (
          <DrawerSurface>
            <BookingForm arrivalDate={rangeStart} departureDate={rangeEnd} />
          </DrawerSurface>
        )}

        {stage === "buy" && (
          <BuyDrawer
            onBookClick={() => {
              setRangeStart(null);
              setRangeEnd(null);
              setStage("calendar");
              setDrawerOpen(true);
            }}
            onContactClick={() => {
              setStage("contact");
              setDrawerOpen(true);
            }}
          />
        )}

        {stage === "contact" && <ContactForm />}

        {stage === "legal" && (
          <DrawerSurface className="border-white/10 bg-[rgba(24,34,30,0.42)] shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-[1px]">
            <LegalNoticesDrawer />
          </DrawerSurface>
        )}

        {stage === "cookies" && <LegalTextDrawer kind="cookies" />}

        {stage === "terms" && <LegalTextDrawer kind="terms" />}
      </div>

      {children}
    </>
  );
}
