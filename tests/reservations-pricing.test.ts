import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateReservationPricingSummary,
  getBalanceDueDate,
  isRangeBookable,
} from "@/lib/reservations";
import type { BookingPromoRecord, OptionRecord } from "@/lib/types";

function localDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function localDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function promo(
  id: string,
  title: string,
  startDate: string,
  endDate: string
): BookingPromoRecord {
  return {
    id,
    title,
    startDate: `${startDate}T00:00:00.000Z`,
    endDate: `${endDate}T00:00:00.000Z`,
    nightlyTtcCents: 19500,
    isActive: true,
  };
}

function summary({
  start,
  end,
  promos = [],
  selectedOptions = [],
}: {
  start: string;
  end: string;
  promos?: BookingPromoRecord[];
  selectedOptions?: OptionRecord[];
}) {
  return calculateReservationPricingSummary({
    arrivalDate: localDate(start),
    departureDate: localDate(end),
    adults: 2,
    children: 0,
    selectedOptions,
    promos,
  });
}

test("two normal nights cost 480 EUR", () => {
  const pricing = summary({ start: "2026-07-01", end: "2026-07-03" });

  assert.equal(pricing.nights, 2);
  assert.equal(pricing.baseTtc, 480);
  assert.equal(pricing.total, 480);
  assert.equal(pricing.deposit, 240);
  assert.equal(pricing.balance, 240);
});

test("two promo nights cost 390 EUR", () => {
  const pricing = summary({
    start: "2026-07-01",
    end: "2026-07-03",
    promos: [promo("promo-1", "Launch offer", "2026-07-01", "2026-07-10")],
  });

  assert.equal(pricing.baseTtc, 390);
  assert.equal(pricing.promoNightCount, 2);
  assert.equal(pricing.normalNightCount, 0);
  assert.equal(pricing.appliedPromos[0]?.nights, 2);
});

test("mixed normal and promo nights are calculated per night", () => {
  const pricing = summary({
    start: "2026-07-01",
    end: "2026-07-04",
    promos: [promo("promo-1", "Launch offer", "2026-07-02", "2026-07-04")],
  });

  assert.equal(pricing.baseTtc, 630);
  assert.equal(pricing.normalNightCount, 1);
  assert.equal(pricing.promoNightCount, 2);
  assert.equal(pricing.normalAccommodationTtc, 240);
  assert.equal(pricing.promoAccommodationTtc, 390);
});

test("one-night stays are not bookable", () => {
  assert.equal(
    isRangeBookable(localDate("2026-07-01"), localDate("2026-07-02")),
    false
  );
  assert.equal(
    isRangeBookable(localDate("2026-07-01"), localDate("2026-07-03")),
    true
  );
});

test("long stays are bookable", () => {
  assert.equal(
    isRangeBookable(localDate("2026-07-01"), localDate("2026-07-16")),
    true
  );
  assert.equal(
    isRangeBookable(localDate("2026-07-01"), localDate("2026-08-01")),
    true
  );
});

test("options are added to total and deposit balance split remains 50 percent", () => {
  const cleaning: OptionRecord = {
    id: "cleaning",
    name: "Frais de nettoyage",
    priceHt: 62.5,
    description: null,
  };
  const pricing = summary({
    start: "2026-07-01",
    end: "2026-07-03",
    selectedOptions: [cleaning],
  });

  assert.equal(pricing.optionSumHt, 62.5);
  assert.equal(pricing.total, 555);
  assert.equal(pricing.deposit, 277.5);
  assert.equal(pricing.balance, 277.5);
});

test("balance due date is 15 days before arrival", () => {
  const arrival = localDate("2026-07-20");
  const dueDate = getBalanceDueDate(arrival);

  assert.equal(localDateKey(dueDate), "2026-07-05");
  assert.equal(
    summary({ start: "2026-07-20", end: "2026-07-22" }).balanceDueDate,
    "2026-07-05"
  );
});
