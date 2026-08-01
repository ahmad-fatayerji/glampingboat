import type Stripe from "stripe";
import type { ReservationStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const OPEN_PAYMENT_STATUSES = ["PENDING", "CHECKOUT_OPEN"] as const;

/** Reservation states that a payment must never move back into CONFIRMED. */
const TERMINAL_RESERVATION_STATUSES: readonly ReservationStatus[] = [
  "CANCELLED",
  "EXPIRED",
  "REFUNDED",
];

type PaymentMatch = {
  amountCents: number;
  currency: string;
};

export function getReservationPaidStatus(
  paidAmountCents: number,
  totalAmountCents: number
) {
  if (paidAmountCents >= totalAmountCents) {
    return "PAID_FULL";
  }

  if (paidAmountCents > 0) {
    return "PAID_DEPOSIT";
  }

  return "UNPAID";
}

/**
 * How much of what was received must be returned, after CGV article 9
 * retention. Zero for a stay where everything paid is legitimately retained.
 */
export function getRefundableTotalCents({
  paidAmountCents,
  retainedAmountCents,
}: {
  paidAmountCents: number;
  retainedAmountCents: number;
}) {
  return Math.max(0, paidAmountCents - retainedAmountCents);
}

/**
 * Whether a reservation's refund obligation is discharged.
 *
 * Completion means "everything article 9 leaves refundable has been sent", not
 * "every cent taken has been sent". Shared by the admin refund endpoint and the
 * charge.refunded webhook: when these two disagreed, a correct partial refund
 * was marked REFUNDED by one and dragged back to REFUND_PENDING by the other.
 */
export function isReservationFullyRefunded({
  paidAmountCents,
  retainedAmountCents,
  refundedAmountCents,
}: {
  paidAmountCents: number;
  retainedAmountCents: number;
  refundedAmountCents: number;
}) {
  return (
    refundedAmountCents >=
    getRefundableTotalCents({ paidAmountCents, retainedAmountCents })
  );
}

export function getSettledPaidAmountCents({
  currentPaidAmountCents,
  paymentAmountCents,
  totalAmountCents,
}: {
  currentPaidAmountCents: number;
  paymentAmountCents: number;
  totalAmountCents: number;
}) {
  return Math.min(totalAmountCents, currentPaidAmountCents + paymentAmountCents);
}

export function assertCheckoutSessionMatchesPayment(
  session: Pick<Stripe.Checkout.Session, "amount_total" | "currency" | "mode">,
  payment: PaymentMatch
) {
  if (session.mode !== "payment") {
    throw new Error("Stripe Checkout Session is not a payment session");
  }

  if (session.amount_total !== payment.amountCents) {
    throw new Error("Stripe Checkout Session amount does not match payment");
  }

  if (session.currency?.toUpperCase() !== payment.currency.toUpperCase()) {
    throw new Error("Stripe Checkout Session currency does not match payment");
  }
}

export async function markCheckoutSessionPaid({
  session,
  stripeEventId,
  actorUserId,
}: {
  session: Stripe.Checkout.Session;
  stripeEventId?: string;
  actorUserId?: string;
}) {
  if (session.payment_status !== "paid") {
    return null;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  const customerId = typeof session.customer === "string" ? session.customer : null;

  const payment = await prisma.bookingPayment.findFirst({
    where: { stripeCheckoutSessionId: session.id },
    include: {
      reservation: true,
    },
  });

  if (!payment) {
    return null;
  }

  assertCheckoutSessionMatchesPayment(session, payment);

  return prisma.$transaction(async (tx) => {
    // Take the row lock before reading anything we branch on. The copy loaded
    // above is only used for the amount assertions; a cancellation may commit
    // between that read and this transaction, and acting on the stale status
    // would flip a cancelled stay back to CONFIRMED. Blocking here until any
    // in-flight cancellation commits guarantees the re-read below is current.
    await tx.$queryRaw`SELECT id FROM "Reservation" WHERE id = ${payment.reservationId} FOR UPDATE`;

    const reservation = await tx.reservation.findUnique({
      where: { id: payment.reservationId },
    });

    if (!reservation) {
      return null;
    }

    const updatedPayment = await tx.bookingPayment.updateMany({
      where: {
        id: payment.id,
        status: { not: "PAID" },
      },
      data: {
        status: "PAID",
        stripeStatus: session.status,
        stripePaymentIntentId: paymentIntentId,
        stripeCustomerId: customerId,
        stripePayload: {
          source: stripeEventId ? "webhook" : "success_return",
          stripeEventId: stripeEventId ?? null,
          checkoutStatus: session.status,
          paymentStatus: session.payment_status,
          amountTotal: session.amount_total,
        },
        paidAt: new Date(),
      },
    });

    if (updatedPayment.count === 0) {
      return reservation;
    }

    const paidAmountCents = getSettledPaidAmountCents({
      currentPaidAmountCents: reservation.paidAmountCents,
      paymentAmountCents: payment.amountCents,
      totalAmountCents: reservation.totalAmountTtcCents,
    });

    // A cancelled stay must never be revived by a late payment: the customer
    // may still hold an open Checkout tab when the booking is cancelled. Record
    // the money so it is never lost, but leave the reservation cancelled and
    // flag it for the owner to refund.
    const isCancelled = TERMINAL_RESERVATION_STATUSES.includes(
      reservation.status
    );

    const reservationPaymentStatus = isCancelled
      ? ("REFUND_PENDING" as const)
      : getReservationPaidStatus(paidAmountCents, reservation.totalAmountTtcCents);

    const updatedReservation = await tx.reservation.update({
      where: { id: payment.reservationId },
      data: {
        paymentStatus: reservationPaymentStatus,
        ...(isCancelled ? {} : { status: "CONFIRMED" as const }),
        paidAmountCents,
      },
    });

    if (isCancelled) {
      await tx.reservationEvent.create({
        data: {
          reservationId: payment.reservationId,
          actorUserId,
          type: "PAYMENT_SUCCEEDED",
          metadata: {
            source: stripeEventId ? "webhook" : "success_return",
            stripeEventId: stripeEventId ?? null,
            stripeCheckoutSessionId: session.id,
            paymentId: payment.id,
            amountCents: payment.amountCents,
            currency: payment.currency,
            reservationStatus: reservation.status,
            note: "Payment received on a cancelled reservation; refund required.",
          },
        },
      });

      return updatedReservation;
    }

    const remainingAmountCents = Math.max(
      0,
      reservation.totalAmountTtcCents - paidAmountCents
    );
    if (remainingAmountCents > 0 && payment.purpose === "DEPOSIT") {
      const existingBalancePayment = await tx.bookingPayment.findFirst({
        where: {
          reservationId: payment.reservationId,
          purpose: "BALANCE",
          status: { in: [...OPEN_PAYMENT_STATUSES, "PAID"] },
        },
        select: { id: true },
      });

      if (!existingBalancePayment) {
        await tx.bookingPayment.create({
          data: {
            reservationId: payment.reservationId,
            provider: "stripe",
            purpose: "BALANCE",
            status: "PENDING",
            amountCents: remainingAmountCents,
            currency: payment.currency,
            idempotencyKey: `checkout:${reservation.bookingRef}:balance`,
            stripeStatus: "not_created",
          },
        });
      }
    }

    await tx.reservationEvent.create({
      data: {
        reservationId: payment.reservationId,
        actorUserId,
        type: "PAYMENT_SUCCEEDED",
        metadata: {
          source: stripeEventId ? "webhook" : "success_return",
          stripeEventId: stripeEventId ?? null,
          stripeCheckoutSessionId: session.id,
          paymentId: payment.id,
          amountCents: payment.amountCents,
          currency: payment.currency,
          paidAmountCents,
          remainingAmountCents,
        },
      },
    });

    return updatedReservation;
  });
}
