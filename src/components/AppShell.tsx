// src/components/AppShell.tsx
"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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

// put your boat images in public/boat/1.jpg, 2.jpg, etc.
const boatImages = [
  "/boat/1.jpg",
  "/boat/2.jpg",
  "/boat/3.jpg",
  "/boat/4.jpg",
  "/boat/5.jpg",
  "/boat/6.jpg",
];

const AppShell: React.FC<AppShellProps> = ({ children, serverToday }) => {
  const [navOpen, setNavOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("calendar");
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const pathname = usePathname();
  const t = useT();

  // Close drawer automatically on legal pages
  useEffect(() => {
    if (["/legal-notices", "/cookies", "/terms"].includes(pathname)) {
      setDrawerOpen(false);
    }
  }, [pathname]);

  // Toggle drawer for BOOK
  const handleBookClick = () => {
    if (drawerOpen && stage === "calendar") {
      setDrawerOpen(false);
    } else {
      setStage("calendar");
      setRangeStart(null);
      setRangeEnd(null);
      setDrawerOpen(true);
    }
  };

  // Toggle drawer for BOAT
  const handleBoatClick = () => {
    if (drawerOpen && stage === "boat") {
      setDrawerOpen(false);
    } else {
      setStage("boat");
      setDrawerOpen(true);
    }
  };

  // Toggle drawer for CONTACT
  const handleContactClick = () => {
    if (drawerOpen && stage === "contact") {
      setDrawerOpen(false);
    } else {
      setStage("contact");
      setDrawerOpen(true);
    }
  };

  const handleRangeSelect = (start: Date, end: Date) => {
    setRangeStart(start);
    setRangeEnd(end);
  };

  const handleNext = () => setStage("form");
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* Mute/unmute */}
      <AudioToggle />

      {/* Wave menu button */}
      <WaveToggle open={navOpen} toggle={() => setNavOpen((o) => !o)} />

      {/* Left NavBox */}
      <div
        className={`fixed bottom-4 left-4 z-40 transform transition-transform duration-300 ease-in-out ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavBox
          onBookClick={handleBookClick}
          onBoatClick={handleBoatClick}
          onContactClick={handleContactClick}
        />
      </div>

      {/* Right Drawer with brand background (#002038) and side chevron toggle */}
      <div
        className={`fixed inset-y-0 right-0 z-50 bg-[#002038]/95 backdrop-blur-sm p-6 md:p-8 text-gray-100 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        } w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5`}
      >
        {/* Side chevron to close */}
        <button
          aria-label={drawerOpen ? "Fermer" : "Ouvrir"}
          onClick={closeDrawer}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-[#002038] text-white rounded-l-full shadow-lg ring-1 ring-white/10 px-2 py-3"
          style={{ writingMode: "horizontal-tb" }}
        >
          ⟨
        </button>

        {/* BOAT GALLERY */}
        {stage === "boat" && <BoatSlideshow images={boatImages} />}

        {/* BOOKING CALENDAR & FORM */}
        {stage === "calendar" && (
          <>
            <MonthCalendar
              availableDates={Array.from({ length: 31 }, (_, i) => i + 1)}
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
                    ➜
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

        {/* CONTACT FORM */}
        {stage === "contact" && <ContactForm />}
      </div>

      {/* Page content */}
      {children}
    </>
  );
};

export default AppShell;
