"use client";

import React, { ReactNode, useState } from "react";
import WaveToggle from "./NavBox/WaveToggle";
import NavBox from "./NavBox/NavBox";
import MonthCalendar from "@/components/MonthCalendar";
import BookingForm from "./Booking/BookingForm";
interface AppShellProps {
  children: ReactNode;
  serverToday: string;
}

type Stage = "calendar" | "form";

const AppShell: React.FC<AppShellProps> = ({ children, serverToday }) => {
  const [navOpen, setNavOpen] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [stage, setStage] = useState<Stage>("calendar");

  // Range selection dates
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  const handleBookClick = () => {
    if (!drawerOpen) {
      // open and reset to calendar
      setStage("calendar");
      setRangeStart(null);
      setRangeEnd(null);
      setDrawerOpen(true);
    } else {
      // close drawer
      setDrawerOpen(false);
      setStage("calendar");
      setRangeStart(null);
      setRangeEnd(null);
    }
  };

  const handleRangeSelect = (start: Date, end: Date) => {
    setRangeStart(start);
    setRangeEnd(end);
  };

  const handleNext = () => {
    setStage("form");
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setStage("calendar");
    setRangeStart(null);
    setRangeEnd(null);
  };

  return (
    <>
      {/* Wave toggle button */}
      <WaveToggle open={navOpen} toggle={() => setNavOpen((o) => !o)} />

      {/* NavBox sliding from left */}
      <div
        className={`fixed bottom-4 left-4 z-40 transform transition-transform duration-300 ease-in-out ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavBox onBookClick={handleBookClick} />
      </div>

      {/* Right-side drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 bg-blue-900 bg-opacity-50 backdrop-filter backdrop-blur-lg p-6 md:p-8 text-gray-100 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        } w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5`}
      >
        <button
          onClick={closeDrawer}
          className="mb-4 text-white hover:text-indigo-300"
        >
          Close ✕
        </button>

        {stage === "calendar" && (
          <div>
            <MonthCalendar
              availableDates={Array.from({ length: 31 }, (_, i) => i + 1)}
              serverToday={serverToday}
              onSelectRange={handleRangeSelect}
            />

            {rangeStart && rangeEnd && (
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm">
                  From: {rangeStart.toLocaleDateString()}
                  <br />
                  To: {rangeEnd.toLocaleDateString()}
                </div>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {stage === "form" && rangeStart && rangeEnd && (
          <BookingForm arrivalDate={rangeStart} departureDate={rangeEnd} />
        )}
      </div>

      {/* Main content */}
      {children}
    </>
  );
};

export default AppShell;
