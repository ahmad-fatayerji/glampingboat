-- Append-only ledger of individual refunds, keyed by Stripe's refund id.
--
-- Replaces incrementing a mutable counter, which double-counted when the admin
-- endpoint and the charge.refunded webhook both recorded the same refund, and
-- lost updates when two refunds settled concurrently. Reservation and payment
-- totals are now derived from this table under the reservation row lock.
CREATE TABLE "PaymentRefund" (
  "id"             TEXT NOT NULL,
  "paymentId"      TEXT NOT NULL,
  "reservationId"  TEXT NOT NULL,
  "stripeRefundId" TEXT NOT NULL,
  "amountCents"    INTEGER NOT NULL,
  "source"         TEXT NOT NULL DEFAULT 'admin',
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PaymentRefund_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentRefund_stripeRefundId_key"
  ON "PaymentRefund"("stripeRefundId");
CREATE INDEX "PaymentRefund_reservationId_idx" ON "PaymentRefund"("reservationId");
CREATE INDEX "PaymentRefund_paymentId_idx" ON "PaymentRefund"("paymentId");

ALTER TABLE "PaymentRefund"
  ADD CONSTRAINT "PaymentRefund_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "BookingPayment"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill any refund already recorded on a payment so the derived totals stay
-- consistent for rows written before the ledger existed.
INSERT INTO "PaymentRefund" ("id", "paymentId", "reservationId", "stripeRefundId", "amountCents", "source")
SELECT
  gen_random_uuid()::text,
  p."id",
  p."reservationId",
  p."stripeRefundId",
  p."refundedAmountCents",
  'backfill'
FROM "BookingPayment" p
WHERE p."stripeRefundId" IS NOT NULL
  AND p."refundedAmountCents" > 0;
