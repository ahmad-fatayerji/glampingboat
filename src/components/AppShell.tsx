"use client";

import React, { ReactNode, useState } from "react";
import WaveToggle from "@/components/NavBox/WaveToggle";
import NavBox from "@/components/NavBox/NavBox";
import MonthCalendar from "@/components/MonthCalendar";
import BookingForm from "@/components/Booking/BookingForm";
import { AudioToggle } from "@/components/Audio/AudioToggle";

interface AppShellProps {
  children: ReactNode;
  serverToday: string;
}

type Stage = "boat" | "calendar" | "form";

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

  const handleBookClick = () => {
    setStage("calendar");
    setRangeStart(null);
    setRangeEnd(null);
    setDrawerOpen(true);
  };

  const handleBoatClick = () => {
    setStage("boat");
    setDrawerOpen(true);
  };

  const handleRangeSelect = (start: Date, end: Date) => {
    setRangeStart(start);
    setRangeEnd(end);
  };

  const handleNext = () => setStage("form");
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* always‐visible mute toggle */}
      <AudioToggle />

      {/* wave menu toggle */}
      <WaveToggle open={navOpen} toggle={() => setNavOpen((o) => !o)} />

      {/* slide‐in navbox on left */}
      <div
        className={`fixed bottom-4 left-4 z-40 transform transition-transform duration-300 ease-in-out ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavBox onBookClick={handleBookClick} onBoatClick={handleBoatClick} />
      </div>

      {/* slide‐in drawer on right */}
      <div
        className={`fixed inset-y-0 right-0 z-50 bg-blue-900 bg-opacity-50 backdrop-blur-lg p-6 md:p-8 text-gray-100 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        } w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5`}
      >
        <button
          onClick={closeDrawer}
          className="mb-4 text-white hover:text-indigo-300"
        >
          Close ✕
        </button>

        {/* —————— BOAT GALLERY —————— */}
        {stage === "boat" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {boatImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Boat image ${i + 1}`}
                className="w-full h-40 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        {/* —————— DATE PICKER —————— */}
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
                  <p>From: {rangeStart.toLocaleDateString()}</p>
                  <p>To: {rangeEnd.toLocaleDateString()}</p>
                </div>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* —————— BOOKING FORM —————— */}
        {stage === "form" && rangeStart && rangeEnd && (
          <BookingForm arrivalDate={rangeStart} departureDate={rangeEnd} />
        )}
      </div>

      {/* page content */}
      {children}
    </>
  );
};

export default AppShell;
