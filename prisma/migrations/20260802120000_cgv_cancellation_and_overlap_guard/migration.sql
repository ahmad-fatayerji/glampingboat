-- CGV article 9 retention audit trail on the reservation.
ALTER TABLE "Reservation"
  ADD COLUMN "cancellationCause" TEXT,
  ADD COLUMN "cancellationTier" TEXT,
  ADD COLUMN "cancellationPolicyVersion" TEXT,
  ADD COLUMN "retainedAmountCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "refundedAmountCents" INTEGER NOT NULL DEFAULT 0;

-- Refund tracking on individual payments.
ALTER TABLE "BookingPayment"
  ADD COLUMN "stripeRefundId" TEXT,
  ADD COLUMN "refundedAmountCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "refundedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "BookingPayment_stripeRefundId_key"
  ON "BookingPayment"("stripeRefundId");

-- Double-booking guard.
--
-- The application checks for overlaps inside a transaction, but PostgreSQL
-- runs at READ COMMITTED by default, so two concurrent bookings can both see
-- an empty calendar and both insert. Only the database can settle this.
--
-- daterange is half-open: [startDate, endDate) means a stay ending on the 5th
-- does not collide with one starting on the 5th, matching the checkout/arrival
-- handover in article 15.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Reservation"
  ADD CONSTRAINT "Reservation_no_active_overlap"
  EXCLUDE USING gist (
    daterange("startDate"::date, "endDate"::date, '[)') WITH &&
  )
  WHERE ("status" IN ('PENDING_PAYMENT', 'CONFIRMED'));

-- Owner-side blocks must not collide with each other either.
ALTER TABLE "AvailabilityBlock"
  ADD CONSTRAINT "AvailabilityBlock_no_overlap"
  EXCLUDE USING gist (
    daterange("startDate"::date, "endDate"::date, '[)') WITH &&
  );
