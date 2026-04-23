"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useT } from "@/components/Language/useT";
import type { ReservationSerialized } from "@/lib/types";

interface BookingCheckoutHandoffProps {
  reservation: ReservationSerialized;
  onClose: () => void;
}

function euroFromCents(value: number) {
  return `\u20AC${(value / 100).toFixed(2)}`;
}

export default function BookingCheckoutHandoff({
  reservation,
  onClose,
}: BookingCheckoutHandoffProps) {
  const t = useT();
  const [confirmed, setConfirmed] = useState(false);
  const pendingPayment = reservation.payments[0];
  const amountDue = pendingPayment?.amountCents ?? reservation.depositAmountCents;
  const paymentLabel = useMemo(
    () =>
      pendingPayment?.purpose === "FULL"
        ? t("payFullNow")
        : t("depositOnBooking"),
    [pendingPayment?.purpose, t]
  );

  if (confirmed) {
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

  return (
    <div className="grid min-h-[34rem] w-full grid-cols-1 gap-6 text-[var(--color-beige)] lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative overflow-hidden border border-white/15 bg-[#0d3350]/25">
        <Image
          src="/images/book/coucher.jpg"
          alt=""
          fill
          sizes="(min-width: 1024px) 36vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative flex min-h-[34rem] flex-col justify-end p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-beige)]/70">
            Stripe Checkout
          </p>
          <h2 className="mt-3 max-w-md font-serif text-4xl leading-tight">
            {t("checkoutReadyTitle")}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--color-beige)]/80">
            {t("checkoutReadyBody")}
          </p>
        </div>
      </section>

      <section className="flex flex-col justify-center border border-white/15 bg-[#f7f4ef] p-6 text-[#0d3350]">
        <div className="text-sm font-semibold text-[#635bff]">stripe</div>
        <div className="mt-10 rounded-lg border border-[#d8dce5] bg-white p-5 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[#687385]">
                {t("book")}
              </div>
              <h3 className="mt-1 text-xl font-semibold text-[#0d3350]">
                Glamping Boat
              </h3>
              {reservation.bookingRef && (
                <p className="mt-1 font-mono text-xs text-[#687385]">
                  {reservation.bookingRef}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-[#687385]">{paymentLabel}</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">
                {euroFromCents(amountDue)}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <div className="h-10 rounded-md bg-[#f0f2f5]" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 rounded-md bg-[#f0f2f5]" />
              <div className="h-10 rounded-md bg-[#f0f2f5]" />
            </div>
            <button
              type="button"
              onClick={() => setConfirmed(true)}
              className="mt-3 h-11 w-full rounded-md bg-[#635bff] text-sm font-semibold text-white transition hover:bg-[#5148e5]"
            >
              {t("continueToConfirmation")}
            </button>
          </div>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-[#687385]">
          {t("checkoutPlaceholderNote")}
        </p>
      </section>
    </div>
  );
}
