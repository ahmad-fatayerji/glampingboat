import type { Prisma, ReservationStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getStripeServerClient } from "@/lib/stripe";
import {
  getRefundableTotalCents,
  isReservationFullyRefunded,
} from "@/lib/stripe-payments";
import { lockReservation, recordRefund } from "@/lib/reservation-state";
import {
  calculateRetention,
  type CancellationCause,
  type RetentionOutcome,
} from "@/lib/cancellation-policy";

/** Payment states holding a Stripe Checkout Session that can still be paid. */
const OPEN_CHECKOUT_STATUSES = ["PENDING", "CHECKOUT_OPEN"] as const;

export class ReservationCancellationError extends Error {
  constructor(
    message: string,
    public readonly status: 404 | 409
  ) {
    super(message);
  }
}

/**
 * Void every Checkout Session still open on a reservation.
 *
 * Without this the customer can pay a link for a stay that is already
 * cancelled. Best effort: Stripe rejects sessions that are already expired or
 * paid, and a failure here must not block the cancellation itself. Any payment
 * that still lands is caught by the terminal-status guard in
 * `markCheckoutSessionPaid`.
 */
async function expireOpenCheckoutSessions(reservationId: string) {
  const openPayments = await prisma.bookingPayment.findMany({
    where: {
      reservationId,
      status: { in: [...OPEN_CHECKOUT_STATUSES] },
      stripeCheckoutSessionId: { not: null },
    },
    select: { id: true, stripeCheckoutSessionId: true },
  });

  if (openPayments.length === 0) {
    return [];
  }

  const stripe = getStripeServerClient();

  return Promise.all(
    openPayments.map(async (payment) => {
      try {
        await stripe.checkout.sessions.expire(
          payment.stripeCheckoutSessionId as string
        );
        return { paymentId: payment.id, expired: true, error: null };
      } catch (error) {
        return {
          paymentId: payment.id,
          expired: false,
          error: error instanceof Error ? error.message : "unknown",
        };
      }
    })
  );
}

export interface CancelReservationResult {
  reservation: Prisma.ReservationGetPayload<Record<string, never>>;
  retention: RetentionOutcome;
}

/**
 * Cancel a reservation and apply the CGV article 9 retention scale.
 *
 * Money is never moved here. The refund owed is computed and recorded, and the
 * reservation is parked in REFUND_PENDING for an admin to release explicitly
 * via `refundReservation`. Automatic outbound payments on a cancellation path
 * are not something this should decide on its own.
 */
export async function cancelReservation({
  reservationId,
  cause,
  reason,
  actorUserId,
  source,
  expectedUserId,
  now = new Date(),
}: {
  reservationId: string;
  cause: CancellationCause;
  reason: string;
  actorUserId?: string;
  source: "customer" | "admin";
  /** When set, the reservation must belong to this user. */
  expectedUserId?: string;
  now?: Date;
}): Promise<CancelReservationResult> {
  // Cheap pre-checks so an unauthorised or already-cancelled request fails
  // before we start calling Stripe. Authoritative state is re-read under the
  // lock below; nothing here is used to compute money.
  const preview = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: { userId: true, status: true },
  });

  if (!preview || (expectedUserId && preview.userId !== expectedUserId)) {
    throw new ReservationCancellationError("Not found", 404);
  }

  if (preview.status === "CANCELLED" || preview.status === "REFUNDED") {
    throw new ReservationCancellationError(
      "Reservation is already cancelled",
      409
    );
  }

  const checkoutExpiry = await expireOpenCheckoutSessions(reservationId);

  const { reservation, retention } = await prisma.$transaction(async (tx) => {
    // Lock and re-read before computing anything. A payment can settle between
    // the pre-check above and here; retention derived from the earlier snapshot
    // would leave newly received money neither retained nor marked refundable.
    // Locking the reservation before touching payments also matches the order
    // used by the settlement path, so the two cannot deadlock.
    const existing = await lockReservation(tx, reservationId);

    if (!existing) {
      throw new ReservationCancellationError("Not found", 404);
    }

    if (existing.status === "CANCELLED" || existing.status === "REFUNDED") {
      throw new ReservationCancellationError(
        "Reservation is already cancelled",
        409
      );
    }

    const retention = calculateRetention({
      cause,
      arrivalDate: existing.startDate,
      now,
      totalAmountTtcCents: existing.totalAmountTtcCents,
      depositAmountCents: existing.depositAmountCents,
      paidAmountCents: existing.paidAmountCents,
    });

    // Close out payments that never completed so no stale CHECKOUT_OPEN row
    // can be reused by the checkout-session endpoint.
    await tx.bookingPayment.updateMany({
      where: {
        reservationId,
        status: { in: [...OPEN_CHECKOUT_STATUSES] },
      },
      data: { status: "CANCELLED", stripeStatus: "cancelled" },
    });

    const updated = await tx.reservation.update({
      where: { id: reservationId },
      data: {
        status: "CANCELLED" as ReservationStatus,
        cancelledAt: existing.cancelledAt ?? now,
        cancellationReason: reason,
        cancellationCause: cause,
        cancellationTier: retention.tier,
        cancellationPolicyVersion: retention.policyVersion,
        retainedAmountCents: retention.retainedCents,
        // Anything owed back parks in REFUND_PENDING until an admin releases
        // it. Sums legitimately retained under article 9 keep their paid
        // status: overwriting it to UNPAID would erase the record of payment.
        ...(retention.refundableCents > 0
          ? { paymentStatus: "REFUND_PENDING" as const }
          : {}),
      },
    });

    await tx.reservationEvent.create({
      data: {
        reservationId,
        actorUserId,
        type: "CANCELLED",
        fromStatus: existing.status,
        toStatus: "CANCELLED",
        metadata: {
          source,
          reason,
          cause,
          policyVersion: retention.policyVersion,
          tier: retention.tier,
          basis: retention.basis,
          daysUntilArrival: retention.daysUntilArrival,
          entitlementCents: retention.entitlementCents,
          retainedCents: retention.retainedCents,
          refundableCents: retention.refundableCents,
          outstandingCents: retention.outstandingCents,
          paidAmountCents: existing.paidAmountCents,
          totalAmountTtcCents: existing.totalAmountTtcCents,
          checkoutSessionsExpired: checkoutExpiry,
        },
      },
    });

    return { reservation: updated, retention };
  });

  return { reservation, retention };
}

/**
 * Release the refund owed on an already-cancelled reservation.
 *
 * Refunds each paid Stripe payment newest-first until the outstanding refund is
 * covered, so partial retention under article 9 maps onto real charges.
 */
export async function refundReservation({
  reservationId,
  actorUserId,
  amountCents,
}: {
  reservationId: string;
  actorUserId?: string;
  /** Defaults to everything still owed under the recorded retention. */
  amountCents?: number;
}) {
  const stripe = getStripeServerClient();

  // The entire operation runs under the reservation row lock, Stripe calls
  // included. Validating the entitlement and spending against it must be
  // atomic: two concurrent requests for different amounts would otherwise pass
  // their own checks, use different idempotency keys, and both succeed,
  // refunding more than article 9 leaves owed. A ledger records that
  // faithfully but cannot undo it, and no client-side guard covers two tabs,
  // two admins, retries, or multiple app instances.
  //
  // Holding a row lock across a network call is the deliberate tradeoff: it
  // blocks only other writers on this one reservation, refunds are rare, and
  // the Stripe client carries a strict timeout. If Stripe succeeds but this
  // transaction later fails, the idempotency keys plus the charge.refunded
  // webhook reconcile the ledger.
  const result = await prisma.$transaction(
    async (tx) => {
      const reservation = await lockReservation(tx, reservationId);

      if (!reservation) {
        throw new ReservationCancellationError("Not found", 404);
      }

      // Retention is only computed at cancellation, so refunding a live
      // booking would have no article 9 basis and would leave a CONFIRMED stay
      // looking paid. Cancel first (OWNER_FORCE_MAJEURE for a goodwill refund).
      if (
        reservation.status !== "CANCELLED" &&
        reservation.status !== "REFUNDED"
      ) {
        throw new ReservationCancellationError(
          "Cancel the reservation before refunding it",
          409
        );
      }

      const owed =
        getRefundableTotalCents({
          paidAmountCents: reservation.paidAmountCents,
          retainedAmountCents: reservation.retainedAmountCents,
        }) - reservation.refundedAmountCents;

      if (owed <= 0) {
        throw new ReservationCancellationError("No refund is owed", 409);
      }

      const target = amountCents ?? owed;
      if (!Number.isInteger(target) || target <= 0 || target > owed) {
        throw new ReservationCancellationError(
          `Refund must be between 1 and ${owed} cents`,
          409
        );
      }

      const payments = await tx.bookingPayment.findMany({
        where: {
          reservationId,
          status: { in: ["PAID", "REFUNDED"] },
          provider: "stripe",
        },
        orderBy: { paidAt: "desc" },
      });

      let remaining = target;
      const refunds: {
        paymentId: string;
        stripeRefundId: string;
        amountCents: number;
      }[] = [];

      for (const payment of payments) {
        if (remaining <= 0) break;

        const refundable = payment.amountCents - payment.refundedAmountCents;
        if (refundable <= 0) continue;
        if (!payment.stripePaymentIntentId) continue;

        const slice = Math.min(refundable, remaining);

        const refund = await stripe.refunds.create(
          {
            payment_intent: payment.stripePaymentIntentId,
            amount: slice,
            metadata: {
              reservationId,
              bookingRef: reservation.bookingRef ?? "",
              paymentId: payment.id,
            },
          },
          // Derived from state already committed, so a retried request that
          // reaches Stripe twice reuses the same refund rather than issuing a
          // second one.
          {
            idempotencyKey: `refund:${payment.id}:${payment.refundedAmountCents}:${slice}`,
          }
        );

        await recordRefund(tx, {
          reservationId,
          paymentId: payment.id,
          stripeRefundId: refund.id,
          amountCents: slice,
          source: "admin",
        });

        await tx.bookingPayment.update({
          where: { id: payment.id },
          data: { stripeRefundId: refund.id },
        });

        refunds.push({
          paymentId: payment.id,
          stripeRefundId: refund.id,
          amountCents: slice,
        });
        remaining -= slice;
      }

      if (refunds.length === 0) {
        throw new ReservationCancellationError(
          "No refundable Stripe payment found; record the refund manually",
          409
        );
      }

      // recordRefund has been recomputing the cached totals as it went, so
      // re-read rather than trusting the figures we started with.
      const settled = await tx.reservation.findUniqueOrThrow({
        where: { id: reservationId },
        select: {
          paidAmountCents: true,
          retainedAmountCents: true,
          refundedAmountCents: true,
          cancellationPolicyVersion: true,
        },
      });

      const refundedCents = target - remaining;

      const next = await tx.reservation.update({
        where: { id: reservationId },
        data: {
          paymentStatus: isReservationFullyRefunded(settled)
            ? "REFUNDED"
            : "REFUND_PENDING",
        },
      });

      await tx.reservationEvent.create({
        data: {
          reservationId,
          actorUserId,
          type: "REFUNDED",
          metadata: {
            refunds,
            refundedCents,
            refundedToDateCents: settled.refundedAmountCents,
            retainedCents: settled.retainedAmountCents,
            policyVersion: settled.cancellationPolicyVersion,
          },
        },
      });

      return { reservation: next, refunds, refundedCents };
    },
    {
      // Must exceed the Stripe client timeout so a slow call fails on Stripe's
      // deadline with the ledger intact, rather than being torn down mid-write.
      timeout: 30_000,
      maxWait: 10_000,
    }
  );

  return result;
}
