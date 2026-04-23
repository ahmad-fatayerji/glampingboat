import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type {
  OptionRecord,
  ReservationPricing,
  ReservationSerialized,
  ReservationPricingSummary,
} from "@/lib/types";

const NIGHT_MS = 86_400_000;
const VAT_RATE = 0.2;
const DEPOSIT_RATE = 0.5;
const SECURITY_DEPOSIT = 500;
const LINEN_OPTION_PATTERN = /linge|lit|linen/i;

const TOURIST_TAX_COMMUNITY_RATE = 0.05;
const TOURIST_TAX_DEPARTMENT_UPLIFT = 0.1;

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
  3: ["closed", "closed", "closed", "closed"], // April
  4: ["low", "low", "high", "high"], // May
  5: ["high", "high", "high", "high"], // June
  6: ["high", "high", "veryHigh", "veryHigh"], // July
  7: ["veryHigh", "veryHigh", "veryHigh", "high"], // August
  8: ["high", "high", "low", "low"], // September
  9: ["low", "low", "closed", "closed"], // October
};

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function getSeasonForDate(date: Date): Season {
  const month = date.getMonth();
  const buckets = MONTH_SEASON_BUCKETS[month];
  if (!buckets) {
    return "closed";
  }

  const day = date.getDate();
  const bucket = Math.min(3, Math.floor((day - 1) / 7));
  return buckets[bucket];
}

export const RESERVATION_WITH_ITEMS_INCLUDE = {
  items: {
    include: {
      option: true,
    },
  },
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
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
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

  let total = 0;
  let uniformSeason: Season | null = null;
  let mixed = false;
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  for (let i = 0; i < nights; i += 1) {
    const season = getSeasonForDate(cursor);
    if (season === "closed") {
      return 0;
    }
    if (uniformSeason === null) {
      uniformSeason = season;
    } else if (uniformSeason !== season) {
      mixed = true;
    }
    total += SEASON_NIGHTLY_TTC[season];
    cursor.setDate(cursor.getDate() + 1);
  }

  // Use weekend / weekly tariffs when the stay matches exactly and falls
  // entirely inside a single season — that gives the published flat rate.
  if (!mixed && uniformSeason) {
    if (nights === 2) {
      return SEASON_WEEKEND_TTC[uniformSeason];
    }
    if (nights === 7) {
      return SEASON_WEEKLY_TTC[uniformSeason];
    }
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
  const perAdultNight = communityShare * (1 + TOURIST_TAX_DEPARTMENT_UPLIFT);
  return round2(perAdultNight * adults * nights);
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

  const optionsTtc = selectedOptions.reduce((sum, option) => {
    const quantity = LINEN_OPTION_PATTERN.test(option.name) ? headCount : 1;
    return sum + option.priceHt * quantity * (1 + VAT_RATE);
  }, 0);
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

export function normalizeReservationPricing(
  pricing: Partial<ReservationPricing> | undefined
) {
  const basePriceHt = pricing?.basePriceHt ?? 0;
  const optionsPriceHt = pricing?.optionSumHt ?? 0;
  const subtotalHt = pricing?.subtotalHt ?? basePriceHt + optionsPriceHt;
  const tvaHt = pricing?.tvaHt ?? subtotalHt * VAT_RATE;
  const taxSejourTtc = pricing?.taxSejourTtc ?? 0;
  const totalTtc = pricing?.total ?? subtotalHt + tvaHt + taxSejourTtc;
  const depositAmount = round2(totalTtc * DEPOSIT_RATE);
  const balanceAmount = round2(totalTtc - depositAmount);

  return {
    basePriceHt,
    optionsPriceHt,
    subtotalHt,
    tvaHt,
    taxSejourTtc,
    totalTtc,
    depositAmount,
    balanceAmount,
    securityDeposit: SECURITY_DEPOSIT,
  };
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
    createdAt: reservation.createdAt.toISOString(),
    items: reservation.items.map((item) => ({
      ...item,
      option: {
        id: item.option.id,
        name: item.option.name,
        priceHt: item.option.priceHt,
        description: item.option.description,
      },
    })),
  };
}
