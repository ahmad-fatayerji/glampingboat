import type {
  Prisma,
  PrismaClient,
  ReservationStatus,
} from "@/generated/prisma/client";
import type {
  OptionRecord,
  ReservationOptionSerialized,
  ReservationSerialized,
  ReservationPricingSummary,
} from "@/lib/types";

const NIGHT_MS = 86_400_000;

export const VAT_RATE = 0.2;
export const DEPOSIT_RATE = 0.5;
export const SECURITY_DEPOSIT = 500;
export const RESERVATION_CURRENCY = "EUR";
export const PRICING_VERSION = "2026-datas-tarifs-reservation";
export const TOURIST_TAX_VERSION = "2026-decazeville-5pct-plus-dept10";
export const TERMS_VERSION = "2026-booking-terms";
export const TERMS_HASH = "pending-legal-review";
export const PRIVACY_VERSION = "2026-privacy";
export const PRIVACY_HASH = "pending-legal-review";

const TOURIST_TAX_COMMUNITY_RATE = 0.05;
const TOURIST_TAX_DEPARTMENT_UPLIFT = 0.1;
const LINEN_OPTION_PATTERN = /linge|lit|linen/i;
const CLEANING_OPTION_PATTERN = /nettoyage|cleaning|household/i;

type Season = "closed" | "veryLow" | "low" | "high" | "veryHigh";

const SEASON_NIGHTLY_TTC: Record<Exclude<Season, "closed">, number> = {
  veryLow: 228,
  low: 228,
  high: 242,
  veryHigh: 285,
};

const SEASON_WEEKLY_TTC: Record<Exclude<Season, "closed">, number> = {
  veryLow: 1590,
  low: 1590,
  high: 1690,
  veryHigh: 1990,
};

const SEASON_WEEKEND_TTC: Record<Exclude<Season, "closed">, number> = {
  veryLow: 690,
  low: 690,
  high: 725,
  veryHigh: 855,
};

const MONTH_SEASON_BUCKETS: Record<number, [Season, Season, Season, Season]> = {
  4: ["low", "low", "high", "high"], // May
  5: ["high", "high", "high", "high"], // June
  6: ["high", "high", "veryHigh", "veryHigh"], // July
  7: ["veryHigh", "veryHigh", "veryHigh", "high"], // August
  8: ["high", "high", "low", "low"], // September
  9: ["low", "low", "closed", "closed"], // October
};

const ACTIVE_RESERVATION_STATUSES: ReservationStatus[] = [
  "PENDING_PAYMENT",
  "CONFIRMED",
];

export function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function toCents(value: number) {
  return Math.round(value * 100);
}

export function fromCents(value: number | null | undefined) {
  return (value ?? 0) / 100;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function seasonOpenStart(year: number) {
  return new Date(year, 4, 1);
}

function seasonOpenEnd(year: number) {
  return new Date(year, 9, 15);
}

function getSeasonForDate(date: Date): Season {
  const dayStart = startOfDay(date);
  if (
    dayStart < seasonOpenStart(dayStart.getFullYear()) ||
    dayStart >= seasonOpenEnd(dayStart.getFullYear())
  ) {
    return "closed";
  }

  const month = dayStart.getMonth();
  const buckets = MONTH_SEASON_BUCKETS[month];
  if (!buckets) {
    return "closed";
  }

  const day = dayStart.getDate();
  const bucket = Math.min(3, Math.floor((day - 1) / 7));
  return buckets[bucket];
}

export const RESERVATION_WITH_ITEMS_INCLUDE = {
  items: {
    include: {
      option: true,
    },
  },
  payments: true,
} satisfies Prisma.ReservationInclude;

export type ReservationWithItems = Prisma.ReservationGetPayload<{
  include: typeof RESERVATION_WITH_ITEMS_INCLUDE;
}>;

export function calculateNightCount(arrivalDate: Date, departureDate: Date) {
  return Math.round(
    (departureDate.getTime() - arrivalDate.getTime()) / NIGHT_MS
  );
}

export function isSeasonOpen(date: Date) {
  return getSeasonForDate(date) !== "closed";
}

export function isRangeBookable(start: Date, end: Date) {
  if (end.getTime() <= start.getTime()) {
    return false;
  }

  const cursor = startOfDay(start);
  while (cursor.getTime() < end.getTime()) {
    if (!isSeasonOpen(cursor)) {
      return false;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return true;
}

export function calculateBaseTtc(start: Date, end: Date) {
  const nights = calculateNightCount(start, end);
  if (nights <= 0) {
    return 0;
  }

  const arrivalSeason = getSeasonForDate(start);
  if (arrivalSeason === "closed") {
    return 0;
  }

  if (nights === 2) {
    return SEASON_WEEKEND_TTC[arrivalSeason];
  }

  if (nights === 7) {
    return SEASON_WEEKLY_TTC[arrivalSeason];
  }

  let total = 0;
  const cursor = startOfDay(start);
  for (let i = 0; i < nights; i += 1) {
    const season = getSeasonForDate(cursor);
    if (season === "closed") {
      return 0;
    }
    total += SEASON_NIGHTLY_TTC[season];
    cursor.setDate(cursor.getDate() + 1);
  }

  return total;
}

export function calculateTouristTaxTtc({
  baseTtc,
  adults,
  children,
  nights,
}: {
  baseTtc: number;
  adults: number;
  children: number;
  nights: number;
}) {
  const totalPersons = Math.max(1, adults + children);
  if (nights <= 0 || adults <= 0 || baseTtc <= 0) {
    return 0;
  }

  const baseHt = baseTtc / (1 + VAT_RATE);
  const perNightHt = baseHt / nights;
  const perPersonNightlyHt = perNightHt / totalPersons;
  const communityShare = perPersonNightlyHt * TOURIST_TAX_COMMUNITY_RATE;
  const perAdultNight = round2(
    communityShare * (1 + TOURIST_TAX_DEPARTMENT_UPLIFT)
  );

  return round2(perAdultNight * adults * nights);
}

export function getOptionQuantity(
  option: Pick<OptionRecord, "name">,
  headCount: number
) {
  if (LINEN_OPTION_PATTERN.test(option.name)) {
    return headCount;
  }

  return 1;
}

export function isCleaningOption(option: Pick<OptionRecord, "name">) {
  return CLEANING_OPTION_PATTERN.test(option.name);
}

export function buildReservationOptionLines(
  options: OptionRecord[],
  headCount: number
) {
  return options.map((option) => {
    const quantity = getOptionQuantity(option, headCount);
    const totalPriceHt = round2(option.priceHt * quantity);

    return {
      option,
      quantity,
      totalPriceHt,
      totalPriceHtCents: toCents(totalPriceHt),
    };
  });
}

export function calculateReservationPricingSummary({
  arrivalDate,
  departureDate,
  adults,
  children,
  selectedOptions,
}: {
  arrivalDate: Date;
  departureDate: Date;
  adults: number;
  children: number;
  selectedOptions: OptionRecord[];
}): ReservationPricingSummary {
  const nights = calculateNightCount(arrivalDate, departureDate);
  const headCount = adults + children;

  const baseTtc = calculateBaseTtc(arrivalDate, departureDate);
  const basePriceHt = round2(baseTtc / (1 + VAT_RATE));
  const optionLines = buildReservationOptionLines(selectedOptions, headCount);
  const optionsTtc = optionLines.reduce(
    (sum, line) => sum + line.totalPriceHt * (1 + VAT_RATE),
    0
  );
  const optionSumHt = round2(optionsTtc / (1 + VAT_RATE));

  const subtotalHt = round2(basePriceHt + optionSumHt);
  const subtotalTtc = round2(baseTtc + optionsTtc);
  const tvaHt = round2(subtotalTtc - subtotalHt);

  const taxSejourTtc = calculateTouristTaxTtc({
    baseTtc,
    adults,
    children,
    nights,
  });

  const total = round2(subtotalTtc + taxSejourTtc);
  const deposit = round2(total * DEPOSIT_RATE);
  const balance = round2(total - deposit);

  return {
    nights,
    baseTtc,
    basePriceHt,
    optionSumHt,
    subtotalHt,
    tvaHt,
    taxSejourTtc,
    total,
    deposit,
    balance,
  };
}

export function toReservationMoneyFields(pricing: ReservationPricingSummary) {
  return {
    basePriceHt: pricing.basePriceHt,
    optionsPriceHt: pricing.optionSumHt,
    subtotalHt: pricing.subtotalHt,
    tvaHt: pricing.tvaHt,
    taxSejourTtc: pricing.taxSejourTtc,
    totalTtc: pricing.total,
    depositAmount: pricing.deposit,
    balanceAmount: pricing.balance,
    securityDeposit: SECURITY_DEPOSIT,
    currency: RESERVATION_CURRENCY,
    baseAmountHtCents: toCents(pricing.basePriceHt),
    optionsAmountHtCents: toCents(pricing.optionSumHt),
    subtotalAmountHtCents: toCents(pricing.subtotalHt),
    vatAmountCents: toCents(pricing.tvaHt),
    touristTaxAmountCents: toCents(pricing.taxSejourTtc),
    totalAmountTtcCents: toCents(pricing.total),
    depositAmountCents: toCents(pricing.deposit),
    balanceAmountCents: toCents(pricing.balance),
    securityDepositAmountCents: toCents(SECURITY_DEPOSIT),
  };
}

export function buildPricingSnapshot({
  pricing,
  selectedOptions,
  adults,
  children,
}: {
  pricing: ReservationPricingSummary;
  selectedOptions: ReturnType<typeof buildReservationOptionLines>;
  adults: number;
  children: number;
}) {
  return {
    pricingVersion: PRICING_VERSION,
    touristTaxVersion: TOURIST_TAX_VERSION,
    currency: RESERVATION_CURRENCY,
    vatRate: VAT_RATE,
    touristTaxCommunityRate: TOURIST_TAX_COMMUNITY_RATE,
    touristTaxDepartmentUplift: TOURIST_TAX_DEPARTMENT_UPLIFT,
    adults,
    children,
    nights: pricing.nights,
    accommodationTtc: pricing.baseTtc,
    accommodationHt: pricing.basePriceHt,
    optionsHt: pricing.optionSumHt,
    vatAmount: pricing.tvaHt,
    touristTaxTtc: pricing.taxSejourTtc,
    totalTtc: pricing.total,
    depositAmount: pricing.deposit,
    balanceAmount: pricing.balance,
    selectedOptions: selectedOptions.map((line) => ({
      id: line.option.id,
      name: line.option.name,
      priceHt: line.option.priceHt,
      quantity: line.quantity,
      totalPriceHt: line.totalPriceHt,
    })),
  };
}

export function buildActiveReservationOverlapWhere(start: Date, end: Date) {
  return {
    status: { in: ACTIVE_RESERVATION_STATUSES },
    startDate: { lt: end },
    endDate: { gt: start },
  } satisfies Prisma.ReservationWhereInput;
}

export async function generateBookingReference(
  client: Pick<PrismaClient, "reservation">
) {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = Math.random()
      .toString(36)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(2, 6);
    const candidate = `${datePart}-${suffix}`;
    const existing = await client.reservation.findUnique({
      where: { bookingRef: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  return `${datePart}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
}

export function serializeReservation(
  reservation: ReservationWithItems
): ReservationSerialized {
  return {
    ...reservation,
    startDate: reservation.startDate.toISOString(),
    endDate: reservation.endDate.toISOString(),
    cancelledAt: reservation.cancelledAt?.toISOString() ?? null,
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
    items: reservation.items.map((item) => ({
      ...item,
      option: {
        id: item.option.id,
        name: item.option.name,
        priceHt: item.option.priceHt,
        description: item.option.description,
      },
    })),
    payments: reservation.payments.map((payment) => ({
      ...payment,
      expiresAt: payment.expiresAt?.toISOString() ?? null,
      paidAt: payment.paidAt?.toISOString() ?? null,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    })),
  };
}

export function serializeReservationOptionLine(
  line: ReturnType<typeof buildReservationOptionLines>[number]
): Pick<ReservationOptionSerialized, "optionId" | "quantity" | "totalPriceHt"> {
  return {
    optionId: line.option.id,
    quantity: line.quantity,
    totalPriceHt: line.totalPriceHt,
  };
}
