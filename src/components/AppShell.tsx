"use client";

import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AudioToggle } from "@/components/Audio/AudioToggle";
import BoatSlideshow, { type BoatSlide } from "@/components/Boat/BoatSlideshow";
import BookingCalendar from "@/components/Booking/BookingCalendar";
import BookingConfirmationPage from "@/components/Booking/BookingConfirmationPage";
import BookingForm from "@/components/Booking/BookingForm";
import BookingSpecPreview from "@/components/Booking/BookingSpecPreview";
import BookingStripePage from "@/components/Booking/BookingStripePage";
import type { ReservationSerialized } from "@/lib/types";
import ContactForm from "@/components/Contact/ContactForm";
import BuyDrawer from "@/components/Drawer/BuyDrawer";
import DrawerSurface from "@/components/Drawer/DrawerSurface";
import LegalTextDrawer from "@/components/Drawer/LegalTextDrawer";
import VisionDrawer from "@/components/Drawer/VisionDrawer";
import LegalNoticesDrawer from "@/components/Legal/LegalNoticesDrawer";
import NavBox from "@/components/NavBox/NavBox";
import WaveToggle from "@/components/NavBox/WaveToggle";
interface AppShellProps {
  children: ReactNode;
  serverToday: string;
}

type Stage =
  | "vision"
  | "boat"
  | "preview"
  | "calendar"
  | "form"
  | "stripe"
  | "confirmation"
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
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("calendar");
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [bookingAdults, setBookingAdults] = useState(2);
  const [bookingChildren, setBookingChildren] = useState(2);
  const [completedReservation, setCompletedReservation] =
    useState<ReservationSerialized | null>(null);
  const { data: session } = useSession();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isAccountRoute = pathname.startsWith("/account");

  useEffect(() => {
    const visibleDrawerOpen = drawerOpen && !isAccountRoute;
    document.documentElement.dataset.drawer = visibleDrawerOpen ? "open" : "closed";
    document.documentElement.dataset.drawerStage = visibleDrawerOpen ? stage : "closed";
  }, [drawerOpen, isAccountRoute, stage]);

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
    if (
      drawerOpen &&
      (stage === "preview" ||
        stage === "calendar" ||
        stage === "form" ||
        stage === "stripe" ||
        stage === "confirmation")
    ) {
      setDrawerOpen(false);
      return;
    }

    setStage("preview");
    setRangeStart(null);
    setRangeEnd(null);
    setCompletedReservation(null);
    setDrawerOpen(true);
  };

  const handleCalendarContinue = (params: {
    arrival: Date;
    departure: Date;
    adults: number;
    children: number;
  }) => {
    if (!session) {
      setNavOpen(false);
      setDrawerOpen(false);
      window.location.href = "/account";
      return;
    }

    setRangeStart(params.arrival);
    setRangeEnd(params.departure);
    setBookingAdults(params.adults);
    setBookingChildren(params.children);
    setStage("form");
  };

  const activeMenuItem =
    drawerOpen && stage === "vision"
      ? "ourVision"
      : drawerOpen && stage === "boat"
        ? "boat"
        : drawerOpen &&
            (stage === "preview" ||
              stage === "calendar" ||
              stage === "form" ||
              stage === "stripe" ||
              stage === "confirmation")
          ? "book"
          : drawerOpen && stage === "buy"
            ? "buy"
            : drawerOpen && stage === "contact"
              ? "contact"
              : null;

  return (
    <>
      <AudioToggle />
      {!isAccountRoute && (
        <>
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

            {stage === "preview" && (
              <DrawerSurface>
                <BookingSpecPreview
                  onBack={() => setDrawerOpen(false)}
                  onContinue={() => setStage("calendar")}
                />
              </DrawerSurface>
            )}

            {stage === "calendar" && (
              <DrawerSurface>
                <BookingCalendar
                  serverToday={serverToday}
                  signedIn={!!session}
                  onContinue={handleCalendarContinue}
                  onContact={() => {
                    setStage("contact");
                    setDrawerOpen(true);
                  }}
                />
              </DrawerSurface>
            )}

            {stage === "form" && rangeStart && rangeEnd && (
              <DrawerSurface>
                <BookingForm
                  arrivalDate={rangeStart}
                  departureDate={rangeEnd}
                  initialAdults={bookingAdults}
                  initialChildren={bookingChildren}
                  onBack={() => setStage("calendar")}
                  onReserved={(reservation) => {
                    setCompletedReservation(reservation);
                    setStage("stripe");
                  }}
                />
              </DrawerSurface>
            )}

            {stage === "stripe" && completedReservation && (
              <DrawerSurface>
                <BookingStripePage
                  reservation={completedReservation}
                  onBack={() => setStage("form")}
                  onConfirm={() => setStage("confirmation")}
                />
              </DrawerSurface>
            )}

            {stage === "confirmation" && completedReservation && (
              <DrawerSurface>
                <BookingConfirmationPage
                  reservation={completedReservation}
                  onClose={() => setDrawerOpen(false)}
                />
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
        </>
      )}

      {children}
    </>
  );
}
