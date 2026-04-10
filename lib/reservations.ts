import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type {
  OptionRecord,
  ReservationPricing,
  ReservationSerialized,
  ReservationPricingSummary,
} from "@/lib/types";

const NIGHT_MS = 86_400_000;
const BASE_NIGHTLY_PRICE_HT = 180;
const VAT_RATE = 0.2;
const TOURIST_TAX_PER_PERSON = 1.5;
const DEPOSIT_RATE = 0.3;
const SECURITY_DEPOSIT = 500;
const LINEN_OPTION_PATTERN = /linge|lit/i;

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
  const basePriceHt = BASE_NIGHTLY_PRICE_HT * nights;
  const optionSumHt = selectedOptions.reduce((sum, option) => {
    const quantity = LINEN_OPTION_PATTERN.test(option.name) ? headCount : 1;
    return sum + option.priceHt * quantity;
  }, 0);
  const subtotalHt = basePriceHt + optionSumHt;
  const tvaHt = subtotalHt * VAT_RATE;
  const taxSejourTtc = TOURIST_TAX_PER_PERSON * nights * headCount;
  const total = subtotalHt + tvaHt + taxSejourTtc;
  const deposit = Number((total * DEPOSIT_RATE).toFixed(2));
  const balance = Number((total - deposit).toFixed(2));

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
  const depositAmount = Number((totalTtc * DEPOSIT_RATE).toFixed(2));
  const balanceAmount = Number((totalTtc - depositAmount).toFixed(2));

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
