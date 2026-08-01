/**
 * Shared locking and money-accounting primitives for reservations.
 *
 * Several independent writers touch a reservation's status and balances: the
 * checkout settlement path, the cancellation service, the admin refund
 * endpoint, and four Stripe webhooks. When each used its own ad-hoc ordering
 * they raced: a cancellation could be computed from a pre-payment snapshot, an
 * expiry webhook could overwrite REFUND_PENDING, and two refunds settling
 * together could lose one of the amounts.
 *
 * The discipline is uniform and every writer must follow it:
 *
 *   1. Open a transaction.
 *   2. `lockReservation(tx, id)` FIRST, before reading anything you branch on.
 *   3. Branch only on the row it returns, never on a pre-transaction read.
 *   4. Write, then commit. The lock releases on commit or rollback.
 *
 * Locking the reservation first everywhere also fixes the lock ordering: paths
 * that took payment locks before the reservation lock could deadlock against
 * paths doing the reverse.
 */

import type {
  BookingPaymentStatus,
  Prisma,
  Reservation,
  ReservationStatus,
} from "@/generated/prisma/client";

/**
 * Reservation states that must never be moved back into an active state, and
 * whose payment status must never be overwritten by a late Stripe event.
 */
export const TERMINAL_RESERVATION_STATUSES: readonly ReservationStatus[] = [
  "CANCELLED",
  "EXPIRED",
  "REFUNDED",
];

export function isTerminalReservation(status: ReservationStatus) {
  return TERMINAL_RESERVATION_STATUSES.includes(status);
}

/**
 * Payment states that a successful Checkout may still settle.
 *
 * Deliberately excludes PAID, REFUNDED and REFUND_PENDING: re-visiting an old
 * success URL after a refund would otherwise resurrect the payment and drag
 * the reservation back into REFUND_PENDING. CANCELLED stays settleable so
 * money that genuinely arrives after a cancellation is still recorded rather
 * than silently dropped.
 */
export const SETTLEABLE_PAYMENT_STATUSES: readonly BookingPaymentStatus[] = [
  "PENDING",
  "CHECKOUT_OPEN",
  "FAILED",
  "EXPIRED",
  "CANCELLED",
];

/**
 * Take the row lock and return the current reservation, or null if it is gone.
 *
 * Blocks until any in-flight writer on the same reservation commits, so the
 * returned row is current as of this transaction. Always call this before
 * reading state you intend to branch on.
 */
export async function lockReservation(
  tx: Prisma.TransactionClient,
  reservationId: string
): Promise<Reservation | null> {
  await tx.$queryRaw`SELECT id FROM "Reservation" WHERE id = ${reservationId} FOR UPDATE`;

  return tx.reservation.findUnique({ where: { id: reservationId } });
}

/**
 * Record a single Stripe refund and bring the derived totals back in line.
 *
 * Idempotent on `stripeRefundId`: recording the same refund twice — two admin
 * clicks receiving the same idempotent Stripe response, or the endpoint and
 * the charge.refunded webhook both observing it — adds it once. Totals are
 * recomputed from the ledger rather than incremented, so concurrent writers
 * converge instead of overwriting each other.
 *
 * Must be called inside a transaction that already holds the reservation lock.
 */
export async function recordRefund(
  tx: Prisma.TransactionClient,
  {
    reservationId,
    paymentId,
    stripeRefundId,
    amountCents,
    source,
  }: {
    reservationId: string;
    paymentId: string;
    stripeRefundId: string;
    amountCents: number;
    source: "admin" | "webhook";
  }
) {
  // createMany + skipDuplicates compiles to INSERT ... ON CONFLICT DO NOTHING,
  // so a refund already recorded by another path is skipped by the database
  // without raising. Catching a P2002 from create() would NOT work here:
  // Postgres marks the whole transaction aborted on a constraint violation, so
  // handling the JavaScript error still leaves every later statement failing.
  // That would break precisely the common case - the charge.refunded webhook
  // arriving after the admin endpoint already recorded the same refund - and
  // every webhook retry would fail the same way.
  await tx.paymentRefund.createMany({
    data: [{ reservationId, paymentId, stripeRefundId, amountCents, source }],
    skipDuplicates: true,
  });

  return syncRefundTotals(tx, { reservationId, paymentId });
}

/**
 * Recompute the cached refund totals on a payment and its reservation from the
 * ledger. Safe to call repeatedly; it is a projection, not an accumulation.
 */
export async function syncRefundTotals(
  tx: Prisma.TransactionClient,
  { reservationId, paymentId }: { reservationId: string; paymentId?: string }
) {
  if (paymentId) {
    const perPayment = await tx.paymentRefund.aggregate({
      where: { paymentId },
      _sum: { amountCents: true },
    });
    const refundedOnPayment = perPayment._sum.amountCents ?? 0;
    const payment = await tx.bookingPayment.findUnique({
      where: { id: paymentId },
      select: { amountCents: true, status: true },
    });

    if (payment) {
      await tx.bookingPayment.update({
        where: { id: paymentId },
        data: {
          refundedAmountCents: refundedOnPayment,
          refundedAt: refundedOnPayment > 0 ? new Date() : null,
          ...(refundedOnPayment >= payment.amountCents
            ? { status: "REFUNDED" as const }
            : {}),
        },
      });
    }
  }

  const perReservation = await tx.paymentRefund.aggregate({
    where: { reservationId },
    _sum: { amountCents: true },
  });
  const refundedTotal = perReservation._sum.amountCents ?? 0;

  await tx.reservation.update({
    where: { id: reservationId },
    data: { refundedAmountCents: refundedTotal },
  });

  return refundedTotal;
}
