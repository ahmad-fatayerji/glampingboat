// src/components/AppShell.tsx
"use client";

import React, { ReactNode, useState } from "react";
import WaveToggle from "@/components/NavBox/WaveToggle";
import NavBox from "@/components/NavBox/NavBox";
import MonthCalendar from "@/components/MonthCalendar";
import BookingForm from "@/components/Booking/BookingForm";
import { AudioToggle } from "@/components/Audio/AudioToggle";

interface AppShellProps {
  /** The page content to render inside the shell */
  children: ReactNode;
  /** ISO‐string of server’s “today” (midnight Paris time) */
  serverToday: string;
}

type Stage = "calendar" | "form";

const AppShell: React.FC<AppShellProps> = ({ children, serverToday }) => {
  // Controls whether the left‐side NavBox is open
  const [navOpen, setNavOpen] = useState(false);

  // Controls whether the right‐side booking drawer is open
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Which stage of the booking flow: calendar picker or form
  const [stage, setStage] = useState<Stage>("calendar");

  // Selected date range
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  // Called when user clicks “Book” in the NavBox
  const handleBookClick = () => {
    // Reset to calendar stage each time
    setStage("calendar");
    setRangeStart(null);
    setRangeEnd(null);
    setDrawerOpen((o) => !o);
  };

  // Called by MonthCalendar when user picks a start & end
  const handleRangeSelect = (start: Date, end: Date) => {
    setRangeStart(start);
    setRangeEnd(end);
  };

  // Move from calendar → form
  const handleNext = () => {
    setStage("form");
  };

  // Close the drawer & reset flow
  const closeDrawer = () => {
    setDrawerOpen(false);
    setStage("calendar");
    setRangeStart(null);
    setRangeEnd(null);
  };

  return (
    <>
      {/* Persisted mute/unmute toggle button */}
      <AudioToggle />

      {/* Wave‐shape menu toggle (bottom‐left) */}
      <WaveToggle open={navOpen} toggle={() => setNavOpen((o) => !o)} />

      {/* Left‐side sliding NavBox */}
      <div
        className={`fixed bottom-4 left-4 z-40 transform transition-transform duration-300 ease-in-out ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavBox onBookClick={handleBookClick} />
      </div>

      {/* Right‐side booking drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50
          bg-blue-900 bg-opacity-50 backdrop-blur-lg
          p-6 md:p-8 text-gray-100 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${drawerOpen ? "translate-x-0" : "translate-x-full"}
          w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5`}
      >
        {/* Close button */}
        <button
          onClick={closeDrawer}
          className="mb-4 text-white hover:text-indigo-300"
        >
          Close ✕
        </button>

        {stage === "calendar" && (
          <>
            {/* Calendar picker */}
            <MonthCalendar
              availableDates={Array.from({ length: 31 }, (_, i) => i + 1)}
              serverToday={serverToday}
              onSelectRange={handleRangeSelect}
            />

            {/* Show “Next” only once both dates chosen */}
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

        {stage === "form" && rangeStart && rangeEnd && (
          /* Booking form with dates pre‐filled */
          <BookingForm arrivalDate={rangeStart} departureDate={rangeEnd} />
        )}
      </div>

      {/* Render the current page’s content */}
      {children}
    </>
  );
};

export default AppShell;
