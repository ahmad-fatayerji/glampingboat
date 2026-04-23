"use client";

import Link from "next/link";
import { useT } from "@/components/Language/useT";
import type { ReservationSerialized } from "@/lib/types";

interface BookingConfirmationPageProps {
  reservation: ReservationSerialized;
  onClose: () => void;
}

export default function BookingConfirmationPage({
  reservation,
  onClose,
}: BookingConfirmationPageProps) {
  const t = useT();

  return (
    <div className="flex min-h-[34rem] w-full flex-col items-center justify-center text-center text-[var(--color-beige)]">
      <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[var(--color-beige)]/30 bg-[var(--color-beige)]/10 text-5xl">
        &#10003;
      </div>
      <h2 className="mt-6 font-serif text-4xl text-[var(--color-beige)]">
        {t("bookingSuccessTitle")}
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--color-beige)]/78">
        {t("bookingSuccessBody")}
      </p>
      {reservation.bookingRef && (
        <div className="mt-5 rounded-md border border-white/15 bg-[#0d3350]/35 px-4 py-2 font-mono text-sm">
          {reservation.bookingRef}
        </div>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/account"
          className="rounded-md bg-[var(--color-blue)] px-5 py-2 text-sm font-medium text-[var(--color-beige)] transition hover:bg-[#06324d]"
          onClick={onClose}
        >
          {t("viewAccount")}
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-[var(--color-beige)]/35 px-5 py-2 text-sm text-[var(--color-beige)] transition hover:bg-white/10"
        >
          {t("close")}
        </button>
      </div>
    </div>
  );
}
