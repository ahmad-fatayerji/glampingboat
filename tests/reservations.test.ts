import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildReservationOptionLines,
  calculateBaseTtc,
  calculateReservationPricingSummary,
  calculateTouristTaxTtc,
  isRangeBookable,
  isSeasonOpen,
} from "../lib/reservations";
import type { OptionRecord } from "../lib/types";

function localDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

describe("reservation tariff calendar", () => {
  it("opens May 1 through nights starting October 14", () => {
    assert.equal(isSeasonOpen(localDate("2026-04-30")), false);
    assert.equal(isSeasonOpen(localDate("2026-05-01")), true);
    assert.equal(isSeasonOpen(localDate("2026-10-14")), true);
    assert.equal(isSeasonOpen(localDate("2026-10-15")), false);

    assert.equal(
      isRangeBookable(localDate("2026-10-14"), localDate("2026-10-15")),
      true
    );
    assert.equal(
      isRangeBookable(localDate("2026-10-15"), localDate("2026-10-16")),
      false
    );
  });

  it("uses published flat rates for exact 2-night and 7-night stays", () => {
    assert.equal(
      calculateBaseTtc(localDate("2026-05-03"), localDate("2026-05-05")),
      690
    );
    assert.equal(
      calculateBaseTtc(localDate("2026-07-19"), localDate("2026-07-26")),
      1990
    );
    assert.equal(
      calculateBaseTtc(localDate("2026-08-16"), localDate("2026-08-23")),
      1990
    );
  });

  it("uses nightly fallback for other stay lengths", () => {
    assert.equal(
      calculateBaseTtc(localDate("2026-05-03"), localDate("2026-05-06")),
      684
    );
  });
});

describe("reservation pricing", () => {
  it("calculates Decazeville tourist tax for adults only", () => {
    assert.equal(
      calculateTouristTaxTtc({
        baseTtc: 1990,
        adults: 2,
        children: 2,
        nights: 7,
      }),
      45.64
    );
  });

  it("includes tourist tax in total and splits deposit/balance", () => {
    const pricing = calculateReservationPricingSummary({
      arrivalDate: localDate("2026-07-19"),
      departureDate: localDate("2026-07-26"),
      adults: 2,
      children: 2,
      selectedOptions: [],
    });

    assert.equal(pricing.baseTtc, 1990);
    assert.equal(pricing.taxSejourTtc, 45.64);
    assert.equal(pricing.total, 2035.64);
    assert.equal(pricing.deposit, 1017.82);
    assert.equal(pricing.balance, 1017.82);
  });

  it("persists option quantities by option type", () => {
    const options: OptionRecord[] = [
      {
        id: "linen",
        name: "Linge de lit (Housses, couette et oreiller)",
        priceHt: 12.5,
      },
      {
        id: "cleaning",
        name: "Frais de nettoyage",
        priceHt: 62.5,
      },
    ];

    const lines = buildReservationOptionLines(options, 4);
    assert.deepEqual(
      lines.map((line) => ({
        id: line.option.id,
        quantity: line.quantity,
        totalPriceHt: line.totalPriceHt,
      })),
      [
        { id: "linen", quantity: 4, totalPriceHt: 50 },
        { id: "cleaning", quantity: 1, totalPriceHt: 62.5 },
      ]
    );
  });
});
