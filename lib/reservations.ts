import type {
  BookingPromo as PrismaBookingPromo,
  AvailabilityBlock as PrismaAvailabilityBlock,
  Prisma,
  PrismaClient,
  ReservationStatus,
} from "@/generated/prisma/client";
import type {
  BookingPromoRecord,
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
export const NORMAL_NIGHTLY_TTC_CENTS = 24000;
export const PROMO_NIGHTLY_TTC_CENTS = 19500;
export const MINIMUM_NIGHTS = 2;
export const BALANCE_DUE_DAYS_BEFORE_ARRIVAL = 15;
export const PRICING_VERSION = "2026-flat-nightly-promo";
export const TOURIST_TAX_VERSION = "2026-included-in-nightly-rate";
export const TERMS_VERSION = "2026-booking-terms";
export const TERMS_HASH = "pending-legal-review";
export const PRIVACY_VERSION = "2026-privacy";
export const PRIVACY_HASH = "pending-legal-review";

const TOURIST_TAX_COMMUNITY_RATE = 0;
const TOURIST_TAX_DEPARTMENT_UPLIFT = 0;
const LINEN_OPTION_PATTERN = /linge|lit|linen/i;
const CLEANING_OPTION_PATTERN = /nettoyage|cleaning|household/i;

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

function parseDateOnly(value: string) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!parts) return new Date(value);

  return new Date(
    Number.parseInt(parts[1], 10),
    Number.parseInt(parts[2], 10) - 1,
    Number.parseInt(parts[3], 10)
  );
}

function addDays(date: Date, days: number) {
  const copy = startOfDay(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function promoToRecord(promo: BookingPromoRecord) {
  return {
    ...promo,
    start: startOfDay(parseDateOnly(promo.startDate)),
    end: startOfDay(parseDateOnly(promo.endDate)),
  };
}

function getPromoForNight(date: Date, promos: BookingPromoRecord[]) {
  const day = startOfDay(date);
  return promos
    .filter((promo) => promo.isActive)
    .map(promoToRecord)
    .find((promo) => day >= promo.start && day < promo.end);
}

export function getBalanceDueDate(arrivalDate: Date) {
  return addDays(arrivalDate, -BALANCE_DUE_DAYS_BEFORE_ARRIVAL);
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
  return !Number.isNaN(date.getTime());
}

export function isRangeBookable(start: Date, end: Date) {
  if (end.getTime() <= start.getTime()) {
    return false;
  }

  return calculateNightCount(start, end) >= MINIMUM_NIGHTS;
}

export function calculateAccommodationPricing(
  start: Date,
  end: Date,
  promos: BookingPromoRecord[] = []
) {
  const nights = calculateNightCount(start, end);
  if (nights <= 0) {
    return {
      totalTtc: 0,
      normalNightCount: 0,
      promoNightCount: 0,
      normalAccommodationTtc: 0,
      promoAccommodationTtc: 0,
      appliedPromos: [],
    };
  }

  let totalCents = 0;
  let normalNightCount = 0;
  let promoNightCount = 0;
  let normalAccommodationCents = 0;
  let promoAccommodationCents = 0;
  const appliedPromoMap = new Map<
    string,
    BookingPromoRecord & { nights: number; amountTtcCents: number }
  >();
  const cursor = startOfDay(start);
  for (let i = 0; i < nights; i += 1) {
    const promo = getPromoForNight(cursor, promos);
    const nightlyCents = promo?.nightlyTtcCents ?? NORMAL_NIGHTLY_TTC_CENTS;
    totalCents += nightlyCents;

    if (promo) {
      promoNightCount += 1;
      promoAccommodationCents += nightlyCents;
      const current = appliedPromoMap.get(promo.id);
      appliedPromoMap.set(promo.id, {
        id: promo.id,
        title: promo.title,
        startDate: promo.startDate,
        endDate: promo.endDate,
        nightlyTtcCents: promo.nightlyTtcCents,
        isActive: promo.isActive,
        nights: (current?.nights ?? 0) + 1,
        amountTtcCents: (current?.amountTtcCents ?? 0) + nightlyCents,
      });
    } else {
      normalNightCount += 1;
      normalAccommodationCents += nightlyCents;
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    totalTtc: round2(totalCents / 100),
    normalNightCount,
    promoNightCount,
    normalAccommodationTtc: round2(normalAccommodationCents / 100),
    promoAccommodationTtc: round2(promoAccommodationCents / 100),
    appliedPromos: Array.from(appliedPromoMap.values()).map((promo) => ({
      id: promo.id,
      title: promo.title,
      startDate: promo.startDate,
      endDate: promo.endDate,
      nightlyTtcCents: promo.nightlyTtcCents,
      nights: promo.nights,
      amountTtc: round2(promo.amountTtcCents / 100),
    })),
  };
}

export function calculateBaseTtc(
  start: Date,
  end: Date,
  promos: BookingPromoRecord[] = []
) {
  return calculateAccommodationPricing(start, end, promos).totalTtc;
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
  void baseTtc;
  void adults;
  void children;
  void nights;
  return 0;
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
  promos = [],
}: {
  arrivalDate: Date;
  departureDate: Date;
  adults: number;
  children: number;
  selectedOptions: OptionRecord[];
  promos?: BookingPromoRecord[];
}): ReservationPricingSummary {
  const nights = calculateNightCount(arrivalDate, departureDate);
  const headCount = adults + children;

  const accommodation = calculateAccommodationPricing(
    arrivalDate,
    departureDate,
    promos
  );
  const baseTtc = accommodation.totalTtc;
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

  const taxSejourTtc = 0;

  const total = round2(subtotalTtc + taxSejourTtc);
  const deposit = round2(total * DEPOSIT_RATE);
  const balance = round2(total - deposit);
  const balanceDueDate = formatDateKey(getBalanceDueDate(arrivalDate));

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
    balanceDueDate,
    normalNightCount: accommodation.normalNightCount,
    promoNightCount: accommodation.promoNightCount,
    normalAccommodationTtc: accommodation.normalAccommodationTtc,
    promoAccommodationTtc: accommodation.promoAccommodationTtc,
    appliedPromos: accommodation.appliedPromos,
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
    balanceDueDate: new Date(`${pricing.balanceDueDate}T00:00:00`),
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
    balanceDueDate: pricing.balanceDueDate,
    normalNightCount: pricing.normalNightCount,
    promoNightCount: pricing.promoNightCount,
    normalAccommodationTtc: pricing.normalAccommodationTtc,
    promoAccommodationTtc: pricing.promoAccommodationTtc,
    appliedPromos: pricing.appliedPromos,
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

export function buildAvailabilityBlockOverlapWhere(start: Date, end: Date) {
  return {
    startDate: { lt: end },
    endDate: { gt: start },
  } satisfies Prisma.AvailabilityBlockWhereInput;
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
    balanceDueDate: reservation.balanceDueDate?.toISOString() ?? null,
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

export function serializeAvailabilityBlock(
  block: PrismaAvailabilityBlock
) {
  return {
    ...block,
    startDate: block.startDate.toISOString(),
    endDate: block.endDate.toISOString(),
    createdAt: block.createdAt.toISOString(),
    updatedAt: block.updatedAt.toISOString(),
  };
}

export function serializeBookingPromo(promo: PrismaBookingPromo) {
  return {
    ...promo,
    startDate: promo.startDate.toISOString(),
    endDate: promo.endDate.toISOString(),
    createdAt: promo.createdAt.toISOString(),
    updatedAt: promo.updatedAt.toISOString(),
  };
}
