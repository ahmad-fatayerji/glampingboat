"use client";

import { ReactNode, useState } from "react";
import WaveToggle from "./NavBox/WaveToggle";
import NavBox from "./NavBox/NavBox";
import BookingForm from "./Booking/BookingForm";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <>
      {/* Wave toggle button */}
      <WaveToggle open={navOpen} toggle={() => setNavOpen((o) => !o)} />

      {/* Sliding NavBox from the left */}
      <div
        className={`
          fixed bottom-4 left-4 z-40
          transform transition-transform duration-300 ease-in-out
          ${navOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <NavBox onBookClick={() => setBookingOpen((b) => !b)} />
      </div>

      {/* Sliding BookingForm drawer from the right */}
      <div
        className={`
          fixed inset-y-0 right-0 z-50
          bg-blue-900 bg-opacity-50 backdrop-filter backdrop-blur-lg
          p-8 text-gray-100 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${bookingOpen ? "translate-x-0" : "translate-x-full"}
          w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5
        `}
      >
        <button
          onClick={() => setBookingOpen((b) => !b)}
          className="mb-4 text-white hover:text-indigo-300"
        >
          Close ✕
        </button>
        <BookingForm />
      </div>

      {/* Main page content */}
      {children}
    </>
  );
}
