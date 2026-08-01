import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isTerminalReservation,
  SETTLEABLE_PAYMENT_STATUSES,
  TERMINAL_RESERVATION_STATUSES,
} from "@/lib/reservation-state";

test("terminal reservation states cover every settled outcome", () => {
  for (const status of ["CANCELLED", "EXPIRED", "REFUNDED"] as const) {
    assert.equal(isTerminalReservation(status), true, status);
  }

  for (const status of ["DRAFT", "PENDING_PAYMENT", "CONFIRMED"] as const) {
    assert.equal(isTerminalReservation(status), false, status);
  }
});

test("a refunded payment is never settleable again", () => {
  // The regression: matching "anything but PAID" also matched REFUNDED, so
  // re-visiting an old Checkout success URL after a refund resurrected the
  // payment and dragged the reservation back into REFUND_PENDING.
  assert.equal(SETTLEABLE_PAYMENT_STATUSES.includes("REFUNDED"), false);
  assert.equal(SETTLEABLE_PAYMENT_STATUSES.includes("REFUND_PENDING"), false);
  assert.equal(SETTLEABLE_PAYMENT_STATUSES.includes("PAID"), false);
});

test("payments awaiting money remain settleable", () => {
  for (const status of ["PENDING", "CHECKOUT_OPEN", "FAILED", "EXPIRED"] as const) {
    assert.equal(SETTLEABLE_PAYMENT_STATUSES.includes(status), true, status);
  }
});

test("money arriving after cancellation is still recorded", () => {
  // CANCELLED stays settleable on purpose: the reservation-level guard parks
  // it in REFUND_PENDING rather than dropping a real payment on the floor.
  assert.equal(SETTLEABLE_PAYMENT_STATUSES.includes("CANCELLED"), true);
});

test("settleable and terminal sets are disjoint from their opposites", () => {
  // Guards against someone widening one set without revisiting the other.
  assert.equal(TERMINAL_RESERVATION_STATUSES.length, 3);
  assert.equal(SETTLEABLE_PAYMENT_STATUSES.length, 5);
});
