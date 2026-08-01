import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateRetention,
  getCancellationTier,
  getDaysUntilArrival,
  isBalanceOverdue,
  type CancellationCause,
} from "@/lib/cancellation-policy";

function localDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** A 5-night stay: 5 x 240,00 EUR = 1 200,00 EUR TTC, acompte 600,00 EUR. */
const STAY_TOTAL_CENTS = 120_000;
const STAY_DEPOSIT_CENTS = 60_000;

function retention({
  cause = "CUSTOMER" as CancellationCause,
  cancelledOn,
  arrival = "2026-09-01",
  paidAmountCents,
  totalAmountTtcCents = STAY_TOTAL_CENTS,
  depositAmountCents = STAY_DEPOSIT_CENTS,
}: {
  cause?: CancellationCause;
  cancelledOn: string;
  arrival?: string;
  paidAmountCents: number;
  totalAmountTtcCents?: number;
  depositAmountCents?: number;
}) {
  return calculateRetention({
    cause,
    arrivalDate: localDate(arrival),
    now: localDate(cancelledOn),
    totalAmountTtcCents,
    depositAmountCents,
    paidAmountCents,
  });
}

test("counts whole days to arrival regardless of time of day", () => {
  const arrival = localDate("2026-09-01");
  const evening = new Date(2026, 7, 2, 23, 30);
  const morning = new Date(2026, 7, 2, 8, 0);

  assert.equal(getDaysUntilArrival(arrival, evening), 30);
  assert.equal(getDaysUntilArrival(arrival, morning), 30);
});

test("a no-show is a negative day count", () => {
  assert.equal(
    getDaysUntilArrival(localDate("2026-09-01"), localDate("2026-09-03")),
    -2
  );
});

test("article 9 tier boundaries resolve in the customer's favour", () => {
  // Exactly 60 days out is still "plus de 60 jours".
  assert.equal(getCancellationTier(61), "OVER_60_DAYS");
  assert.equal(getCancellationTier(60), "OVER_60_DAYS");
  assert.equal(getCancellationTier(59), "BETWEEN_60_AND_15_DAYS");
  // Exactly 15 days out is the 50% band, not the 100% band.
  assert.equal(getCancellationTier(15), "BETWEEN_60_AND_15_DAYS");
  assert.equal(getCancellationTier(14), "UNDER_15_DAYS");
  assert.equal(getCancellationTier(0), "UNDER_15_DAYS");
  assert.equal(getCancellationTier(-3), "UNDER_15_DAYS");
});

test("article 9: over 60 days, the acompte is retained and the rest refunded", () => {
  // Paid in full, cancels 90 days out: keeps 600,00, refunds 600,00.
  const outcome = retention({
    cancelledOn: "2026-06-03",
    paidAmountCents: STAY_TOTAL_CENTS,
  });

  assert.equal(outcome.tier, "OVER_60_DAYS");
  assert.equal(outcome.basis, "DEPOSIT");
  assert.equal(outcome.retainedCents, STAY_DEPOSIT_CENTS);
  assert.equal(outcome.refundableCents, 60_000);
  assert.equal(outcome.outstandingCents, 0);
});

test("article 9: over 60 days having paid only the acompte refunds nothing", () => {
  const outcome = retention({
    cancelledOn: "2026-06-03",
    paidAmountCents: STAY_DEPOSIT_CENTS,
  });

  assert.equal(outcome.retainedCents, STAY_DEPOSIT_CENTS);
  assert.equal(outcome.refundableCents, 0);
  assert.equal(outcome.outstandingCents, 0);
});

test("article 9: between 60 and 15 days retains half the stay", () => {
  const outcome = retention({
    cancelledOn: "2026-08-01",
    paidAmountCents: STAY_TOTAL_CENTS,
  });

  assert.equal(outcome.tier, "BETWEEN_60_AND_15_DAYS");
  assert.equal(outcome.basis, "HALF_OF_STAY");
  assert.equal(outcome.retainedCents, 60_000);
  assert.equal(outcome.refundableCents, 60_000);
});

test("article 9: under 15 days retains the whole stay", () => {
  const outcome = retention({
    cancelledOn: "2026-08-25",
    paidAmountCents: STAY_TOTAL_CENTS,
  });

  assert.equal(outcome.tier, "UNDER_15_DAYS");
  assert.equal(outcome.basis, "FULL_STAY");
  assert.equal(outcome.retainedCents, STAY_TOTAL_CENTS);
  assert.equal(outcome.refundableCents, 0);
});

test("article 9: cancelling late on the acompte alone leaves a shortfall", () => {
  // Entitled to 100% but only 50% was received: 600,00 remains owed.
  const outcome = retention({
    cancelledOn: "2026-08-25",
    paidAmountCents: STAY_DEPOSIT_CENTS,
  });

  assert.equal(outcome.entitlementCents, STAY_TOTAL_CENTS);
  assert.equal(outcome.retainedCents, STAY_DEPOSIT_CENTS);
  assert.equal(outcome.refundableCents, 0);
  assert.equal(outcome.outstandingCents, 60_000);
});

test("a no-show is treated as the full-stay tier", () => {
  const outcome = retention({
    cancelledOn: "2026-09-02",
    paidAmountCents: STAY_TOTAL_CENTS,
  });

  assert.equal(outcome.basis, "FULL_STAY");
  assert.equal(outcome.refundableCents, 0);
});

test("article 2: cancelling for an unpaid balance refunds nothing, at any date", () => {
  for (const cancelledOn of ["2026-06-03", "2026-08-01", "2026-08-25"]) {
    const outcome = retention({
      cause: "BALANCE_UNPAID",
      cancelledOn,
      paidAmountCents: STAY_DEPOSIT_CENTS,
    });

    assert.equal(outcome.basis, "ALL_SUMS_PAID");
    assert.equal(outcome.retainedCents, STAY_DEPOSIT_CENTS);
    assert.equal(outcome.refundableCents, 0);
    assert.equal(outcome.outstandingCents, 0);
  }
});

test("article 9: owner force majeure refunds everything, at any date", () => {
  for (const cancelledOn of ["2026-06-03", "2026-08-25", "2026-09-02"]) {
    const outcome = retention({
      cause: "OWNER_FORCE_MAJEURE",
      cancelledOn,
      paidAmountCents: STAY_TOTAL_CENTS,
    });

    assert.equal(outcome.basis, "NONE");
    assert.equal(outcome.retainedCents, 0);
    assert.equal(outcome.refundableCents, STAY_TOTAL_CENTS);
  }
});

test("nothing is refundable when nothing was paid", () => {
  const outcome = retention({
    cancelledOn: "2026-06-03",
    paidAmountCents: 0,
  });

  assert.equal(outcome.retainedCents, 0);
  assert.equal(outcome.refundableCents, 0);
  assert.equal(outcome.outstandingCents, STAY_DEPOSIT_CENTS);
});

test("retention never exceeds sums actually paid", () => {
  const outcome = retention({
    cancelledOn: "2026-08-25",
    paidAmountCents: 1_000,
  });

  assert.equal(outcome.retainedCents, 1_000);
  assert.equal(outcome.refundableCents, 0);
});

test("odd stay totals split without losing a cent", () => {
  const outcome = retention({
    cancelledOn: "2026-08-01",
    totalAmountTtcCents: 100_001,
    depositAmountCents: 50_001,
    paidAmountCents: 100_001,
  });

  assert.equal(outcome.retainedCents + outcome.refundableCents, 100_001);
});

test("the acompte retained is the stored snapshot, not a recomputed rate", () => {
  // A reservation sold under a 30% acompte keeps those terms.
  const outcome = retention({
    cancelledOn: "2026-06-03",
    depositAmountCents: 36_000,
    paidAmountCents: STAY_TOTAL_CENTS,
  });

  assert.equal(outcome.retainedCents, 36_000);
  assert.equal(outcome.refundableCents, 84_000);
});

test("article 2: the balance is overdue only inside 15 days and underpaid", () => {
  const arrivalDate = localDate("2026-09-01");
  const base = { arrivalDate, totalAmountTtcCents: STAY_TOTAL_CENTS };

  assert.equal(
    isBalanceOverdue({
      ...base,
      now: localDate("2026-08-25"),
      paidAmountCents: STAY_DEPOSIT_CENTS,
    }),
    true
  );
  // Exactly on the due date the customer still has the day.
  assert.equal(
    isBalanceOverdue({
      ...base,
      now: localDate("2026-08-17"),
      paidAmountCents: STAY_DEPOSIT_CENTS,
    }),
    false
  );
  // Fully paid is never overdue.
  assert.equal(
    isBalanceOverdue({
      ...base,
      now: localDate("2026-08-25"),
      paidAmountCents: STAY_TOTAL_CENTS,
    }),
    false
  );
});
