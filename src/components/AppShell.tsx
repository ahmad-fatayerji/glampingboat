"use client";

import React, {
  startTransition,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import WaveToggle from "@/components/NavBox/WaveToggle";
import NavBox from "@/components/NavBox/NavBox";
import MonthCalendar from "@/components/MonthCalendar";
import BookingForm from "@/components/Booking/BookingForm";
import BoatSlideshow from "@/components/Boat/BoatSlideshow";
import ContactForm from "@/components/Contact/ContactForm";
import { AudioToggle } from "@/components/Audio/AudioToggle";
import { useT } from "@/components/Language/useT";

interface AppShellProps {
  children: ReactNode;
  serverToday: string;
}

type Stage = "boat" | "calendar" | "form" | "contact";

const BOAT_IMAGES = [
  "/boat/1.jpg",
  "/boat/2.jpg",
  "/boat/3.jpg",
  "/boat/4.jpg",
  "/boat/5.jpg",
  "/boat/6.jpg",
];

const LEGAL_PATHS = ["/legal-notices", "/cookies", "/terms"];

export default function AppShell({ children, serverToday }: AppShellProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("calendar");
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const pathname = usePathname();
  const t = useT();
  const { data: session } = useSession();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

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
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (dx > 60 && absDx > absDy * 1.2) {
      setDrawerOpen(false);
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  useEffect(() => {
    if (LEGAL_PATHS.includes(pathname)) {
      startTransition(() => {
        setDrawerOpen(false);
      });
    }
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.drawer = drawerOpen ? "open" : "closed";
    document.documentElement.dataset.drawerStage = drawerOpen ? stage : "closed";
  }, [drawerOpen, stage]);

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

  const handleBoatClick = () => {
    if (drawerOpen && stage === "boat") {
      setDrawerOpen(false);
      return;
    }

    setStage("boat");
    setDrawerOpen(true);
  };

  const handleContactClick = () => {
    if (drawerOpen && stage === "contact") {
      setDrawerOpen(false);
      return;
    }

    setStage("contact");
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
    drawerOpen && (stage === "calendar" || stage === "form")
      ? "book"
      : drawerOpen && stage === "boat"
        ? "boat"
        : drawerOpen && stage === "contact"
          ? "contact"
          : pathname === "/buy"
              ? "buy"
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
          onBookClick={handleBookClick}
          onBoatClick={handleBoatClick}
          onContactClick={handleContactClick}
          activeItem={activeMenuItem}
        />
      </div>

      <div
        className={`fixed inset-y-0 right-0 z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        } ${
          stage === "contact"
            ? "w-full bg-transparent p-0 text-gray-100 sm:w-[82vw] lg:w-[72vw] xl:w-[60vw]"
            : "w-full bg-[#002038]/95 p-6 text-gray-100 backdrop-blur-sm sm:w-3/4 md:p-8 lg:w-1/2 xl:w-2/5"
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {stage === "boat" && <BoatSlideshow images={BOAT_IMAGES} />}

        {stage === "calendar" && (
          <>
            {!session && (
              <div className="mb-4 rounded-xl bg-[var(--color-beige)]/80 text-[var(--color-blue)] p-4 text-sm leading-relaxed border border-[var(--color-blue)]/10">
                <p className="font-medium mb-1">Sign in required to book</p>
                <p className="opacity-80 mb-3">
                  Create an account or sign in before selecting dates and
                  completing your reservation.
                </p>
                <a
                  href="/account"
                  className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide bg-[var(--color-blue)] text-[var(--color-beige)] hover:bg-[#06324d] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-blue)]/40 transition"
                >
                  Go to account &rarr;
                </a>
              </div>
            )}
            <MonthCalendar
              availableDates={Array.from({ length: 31 }, (_, index) => index + 1)}
              serverToday={serverToday}
              onSelectRange={handleRangeSelect}
            />
            {rangeStart && rangeEnd && (
              <div className="mt-4 flex justify-between items-center">
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
                  className="group relative inline-flex items-center gap-2 rounded-full px-6 py-2 font-semibold text-white bg-gradient-to-r from-indigo-600 via-blue-700 to-indigo-600 shadow-lg shadow-indigo-900/30 hover:from-indigo-500 hover:via-blue-600 hover:to-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400 transition-colors"
                >
                  <span>{t("next")}</span>
                  <span className="transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                  <span className="absolute inset-0 rounded-full ring-1 ring-white/10 pointer-events-none" />
                </button>
              </div>
            )}
          </>
        )}

        {stage === "form" && rangeStart && rangeEnd && (
          <BookingForm arrivalDate={rangeStart} departureDate={rangeEnd} />
        )}

        {stage === "contact" && <ContactForm />}
      </div>

      {children}
    </>
  );
}
