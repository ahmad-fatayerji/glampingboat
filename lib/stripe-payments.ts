import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const OPEN_PAYMENT_STATUSES = ["PENDING", "CHECKOUT_OPEN"] as const;

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
      return payment.reservation;
    }

    const paidAmountCents = getSettledPaidAmountCents({
      currentPaidAmountCents: payment.reservation.paidAmountCents,
      paymentAmountCents: payment.amountCents,
      totalAmountCents: payment.reservation.totalAmountTtcCents,
    });
    const reservationPaymentStatus = getReservationPaidStatus(
      paidAmountCents,
      payment.reservation.totalAmountTtcCents
    );

    const updatedReservation = await tx.reservation.update({
      where: { id: payment.reservationId },
      data: {
        paymentStatus: reservationPaymentStatus,
        status: "CONFIRMED",
        paidAmountCents,
      },
    });

    const remainingAmountCents = Math.max(
      0,
      payment.reservation.totalAmountTtcCents - paidAmountCents
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
            idempotencyKey: `checkout:${payment.reservation.bookingRef}:balance`,
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
