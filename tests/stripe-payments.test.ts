import assert from "node:assert/strict";
import { test } from "node:test";
import type Stripe from "stripe";
import {
  assertCheckoutSessionMatchesPayment,
  getReservationPaidStatus,
  getSettledPaidAmountCents,
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
