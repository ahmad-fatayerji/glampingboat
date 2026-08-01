import assert from "node:assert/strict";
import { test } from "node:test";
import type Stripe from "stripe";
import {
  assertCheckoutSessionMatchesPayment,
  getRefundableTotalCents,
  getReservationPaidStatus,
  getSettledPaidAmountCents,
  isReservationFullyRefunded,
} from "@/lib/stripe-payments";

function checkoutSession(
  overrides: Partial<Pick<Stripe.Checkout.Session, "amount_total" | "currency" | "mode">> = {}
) {
  return {
    amount_total: 72000,
    currency: "eur",
    mode: "payment",
    ...overrides,
  } as Pick<Stripe.Checkout.Session, "amount_total" | "currency" | "mode">;
}

test("reservation paid status follows settled cents", () => {
  assert.equal(getReservationPaidStatus(0, 72000), "UNPAID");
  assert.equal(getReservationPaidStatus(36000, 72000), "PAID_DEPOSIT");
  assert.equal(getReservationPaidStatus(72000, 72000), "PAID_FULL");
  assert.equal(getReservationPaidStatus(80000, 72000), "PAID_FULL");
});

test("settled paid amount is capped at the reservation total", () => {
  assert.equal(
    getSettledPaidAmountCents({
      currentPaidAmountCents: 36000,
      paymentAmountCents: 36000,
      totalAmountCents: 72000,
    }),
    72000
  );
  assert.equal(
    getSettledPaidAmountCents({
      currentPaidAmountCents: 70000,
      paymentAmountCents: 10000,
      totalAmountCents: 72000,
    }),
    72000
  );
});

test("matching checkout sessions can settle a payment", () => {
  assert.doesNotThrow(() =>
    assertCheckoutSessionMatchesPayment(checkoutSession(), {
      amountCents: 72000,
      currency: "EUR",
    })
  );
});

test("checkout session settlement rejects wrong amount, currency, or mode", () => {
  assert.throws(
    () =>
      assertCheckoutSessionMatchesPayment(checkoutSession({ amount_total: 71000 }), {
        amountCents: 72000,
        currency: "EUR",
      }),
    /amount/
  );
  assert.throws(
    () =>
      assertCheckoutSessionMatchesPayment(checkoutSession({ currency: "usd" }), {
        amountCents: 72000,
        currency: "EUR",
      }),
    /currency/
  );
  assert.throws(
    () =>
      assertCheckoutSessionMatchesPayment(checkoutSession({ mode: "setup" }), {
        amountCents: 72000,
        currency: "EUR",
      }),
    /payment session/
  );
});

test("refundable total excludes sums retained under article 9", () => {
  // 100,00 EUR taken, 50,00 retained: only 50,00 is ever owed back.
  assert.equal(
    getRefundableTotalCents({
      paidAmountCents: 10_000,
      retainedAmountCents: 5_000,
    }),
    5_000
  );
  // Everything retained: nothing is owed.
  assert.equal(
    getRefundableTotalCents({
      paidAmountCents: 10_000,
      retainedAmountCents: 10_000,
    }),
    0
  );
  // Retention above what was received never yields a negative obligation.
  assert.equal(
    getRefundableTotalCents({
      paidAmountCents: 5_000,
      retainedAmountCents: 12_000,
    }),
    0
  );
});

test("a partial refund that discharges the obligation counts as complete", () => {
  // The regression: on a 100,00 booking with 50,00 retained, refunding 50,00
  // is complete. Comparing against paid rather than paid-minus-retained made
  // charge.refunded drag the booking back to REFUND_PENDING forever.
  assert.equal(
    isReservationFullyRefunded({
      paidAmountCents: 10_000,
      retainedAmountCents: 5_000,
      refundedAmountCents: 5_000,
    }),
    true
  );
  // Short of the refundable total is still outstanding.
  assert.equal(
    isReservationFullyRefunded({
      paidAmountCents: 10_000,
      retainedAmountCents: 5_000,
      refundedAmountCents: 4_999,
    }),
    false
  );
});

test("nothing is owed when article 9 retains everything paid", () => {
  // Cancelled inside 15 days: 100% retained, so zero refunded is complete.
  assert.equal(
    isReservationFullyRefunded({
      paidAmountCents: 60_000,
      retainedAmountCents: 60_000,
      refundedAmountCents: 0,
    }),
    true
  );
});

test("a force majeure cancellation is complete only once everything is returned", () => {
  const base = { paidAmountCents: 120_000, retainedAmountCents: 0 };

  assert.equal(
    isReservationFullyRefunded({ ...base, refundedAmountCents: 60_000 }),
    false
  );
  assert.equal(
    isReservationFullyRefunded({ ...base, refundedAmountCents: 120_000 }),
    true
  );
});
