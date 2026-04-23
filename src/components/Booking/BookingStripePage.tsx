"use client";

import { useState } from "react";
import { useT } from "@/components/Language/useT";
import { getErrorMessage, readJsonResponse } from "@/lib/http";
import type { ReservationSerialized } from "@/lib/types";

interface BookingStripePageProps {
  reservation: ReservationSerialized;
  onBack: () => void;
}

interface CheckoutSessionResponse {
  sessionId?: string;
  checkoutUrl?: string | null;
  error?: string;
}

function euroFromCents(value: number) {
  return `€${(value / 100).toFixed(2)}`;
}

export default function BookingStripePage({
  reservation,
  onBack,
}: BookingStripePageProps) {
  const t = useT();
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingPayment = reservation.payments[0];
  const amountDueCents =
    pendingPayment?.amountCents ?? reservation.depositAmountCents;
  const paymentLabel =
    pendingPayment?.purpose === "FULL"
      ? t("payFullNow")
      : t("depositOnBooking");

  const handleCheckout = async () => {
    setError(null);
    setRedirecting(true);

    try {
      const response = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId: reservation.id }),
      });

      const json = await readJsonResponse<CheckoutSessionResponse>(
        response,
        {},
      );

      if (!response.ok || !json.sessionId) {
        throw new Error(json.error || "Failed to create checkout session");
      }

      if (!json.checkoutUrl) {
        throw new Error("Checkout URL is missing");
      }

      window.location.assign(json.checkoutUrl);
    } catch (checkoutError) {
      setError(
        getErrorMessage(checkoutError, "Failed to start Stripe checkout"),
      );
      setRedirecting(false);
    }
  };

  return (
    <div className="w-full text-[var(--color-beige)]">
      <section className="flex flex-col justify-center border border-white/15 bg-[#f7f4ef] p-6 text-[#0d3350]">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-[#635bff]">stripe</div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-[#687385] transition hover:text-[#0d3350]"
          >
            &lsaquo; {t("previous")}
          </button>
        </div>
        <div className="mt-8 rounded-lg border border-[#d8dce5] bg-white p-5 shadow-xl">
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
                {euroFromCents(amountDueCents)}
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
              onClick={handleCheckout}
              disabled={redirecting}
              className="mt-3 h-11 w-full rounded-md bg-[#635bff] text-sm font-semibold text-white transition hover:bg-[#5148e5]"
            >
              {redirecting ? t("saving") : t("continueToCheckout")}
            </button>
          </div>
        </div>

        {error && <p className="mt-4 text-xs text-[#d14343]">{error}</p>}

        <p className="mt-5 text-xs leading-relaxed text-[#687385]">
          {t("checkoutLiveNote")}
        </p>
      </section>
    </div>
  );
}
