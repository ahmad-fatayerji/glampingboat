import { NextRequest, NextResponse } from "next/server";
import { auth } from "@auth";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/http";
import { isProfileComplete, USER_PROFILE_SELECT } from "@/lib/profile";
import {
  buildActiveReservationOverlapWhere,
  buildPricingSnapshot,
  buildReservationOptionLines,
  calculateReservationPricingSummary,
  generateBookingReference,
  isRangeBookable,
  PRIVACY_HASH,
  PRIVACY_VERSION,
  PRICING_VERSION,
  RESERVATION_CURRENCY,
  RESERVATION_WITH_ITEMS_INCLUDE,
  serializeReservation,
  TERMS_HASH,
  TERMS_VERSION,
  toCents,
  toReservationMoneyFields,
  TOURIST_TAX_VERSION,
  VAT_RATE,
} from "@/lib/reservations";
import {
  getBoolean,
  getNumber,
  getString,
  getStringArray,
  isRecord,
} from "@/lib/type-guards";

const AVAILABILITY_SELECT = {
  id: true,
  startDate: true,
  endDate: true,
  status: true,
} satisfies Prisma.ReservationSelect;

function parseBookingDate(value: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10) - 1,
      Number.parseInt(day, 10)
    );
  }

  return new Date(value);
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getClientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null
  );
}

function parseReservationPayload(body: unknown) {
  if (!isRecord(body)) {
    return null;
  }

  return {
    startDate: getString(body, "startDate"),
    endDate: getString(body, "endDate"),
    adults: getNumber(body, "adults"),
    children: getNumber(body, "children"),
    optionIds: getStringArray(body, "optionIds"),
    payFullNow: getBoolean(body, "payFullNow") ?? false,
    acceptTerms: getBoolean(body, "acceptTerms") ?? false,
    locale: getString(body, "locale") ?? "en",
  };
}

export async function GET(req: NextRequest) {
  const availability = req.nextUrl.searchParams.get("availability");
  if (availability !== "1") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const today = startOfDay(new Date());
  const reservations = await prisma.reservation.findMany({
    where: {
      status: { in: ["PENDING_PAYMENT", "CONFIRMED"] },
      endDate: { gte: today },
    },
    orderBy: { startDate: "asc" },
    select: AVAILABILITY_SELECT,
  });

  return NextResponse.json(
    reservations.map((reservation) => ({
      id: reservation.id,
      startDate: reservation.startDate.toISOString(),
      endDate: reservation.endDate.toISOString(),
      status: reservation.status,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: USER_PROFILE_SELECT,
  });
  if (!isProfileComplete(profile)) {
    return NextResponse.json({ error: "Profile incomplete" }, { status: 400 });
  }

  try {
    const parsed = parseReservationPayload(await req.json());
    if (
      !parsed?.startDate ||
      !parsed.endDate ||
      parsed.adults === undefined ||
      parsed.children === undefined
    ) {
      return NextResponse.json(
        { error: "Invalid reservation payload" },
        { status: 400 }
      );
    }

    if (!parsed.acceptTerms) {
      return NextResponse.json(
        { error: "Terms must be accepted" },
        { status: 400 }
      );
    }

    if (parsed.adults < 1 || parsed.children < 0) {
      return NextResponse.json(
        { error: "Invalid guest counts" },
        { status: 400 }
      );
    }
    const adults = parsed.adults;
    const children = parsed.children;

    const start = startOfDay(parseBookingDate(parsed.startDate));
    const end = startOfDay(parseBookingDate(parsed.endDate));
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
    }

    if (!isRangeBookable(start, end)) {
      return NextResponse.json(
        { error: "Dates are not bookable" },
        { status: 400 }
      );
    }

    const optionIds = Array.from(new Set(parsed.optionIds));
    const selectedOptions = await prisma.option.findMany({
      where: { id: { in: optionIds } },
      select: {
        id: true,
        name: true,
        priceHt: true,
        description: true,
      },
    });

    if (selectedOptions.length !== optionIds.length) {
      return NextResponse.json(
        { error: "Invalid reservation options" },
        { status: 400 }
      );
    }

    const pricing = calculateReservationPricingSummary({
      arrivalDate: start,
      departureDate: end,
      adults,
      children,
      selectedOptions,
    });
    const headCount = parsed.adults + parsed.children;
    const optionLines = buildReservationOptionLines(selectedOptions, headCount);
    const pricingSnapshot = buildPricingSnapshot({
      pricing,
      selectedOptions: optionLines,
      adults,
      children,
    });
    const amountDueCents = parsed.payFullNow
      ? toCents(pricing.total)
      : toCents(pricing.deposit);

    const userAgent = req.headers.get("user-agent");
    const locale = parsed.locale.slice(0, 12);

    const reservationId = await prisma.$transaction(async (tx) => {
      const overlapping = await tx.reservation.findFirst({
        where: buildActiveReservationOverlapWhere(start, end),
        select: { id: true },
      });

      if (overlapping) {
        throw new Error("Dates are already reserved");
      }

      const bookingRef = await generateBookingReference(tx);
      const reservation = await tx.reservation.create({
        data: {
          userId: session.user.id,
          bookingRef,
          status: "PENDING_PAYMENT",
          paymentStatus: "CHECKOUT_OPEN",
          startDate: start,
          endDate: end,
          adults,
          children,
          ...toReservationMoneyFields(pricing),
          customerFirstName: profile?.firstName,
          customerLastName: profile?.lastName,
          customerEmail: profile?.email,
          customerPhone: profile?.phone,
          customerMobile: profile?.mobile,
          billingAddressNumber: profile?.addressNumber,
          billingAddressStreet: profile?.addressStreet,
          billingAddressCity: profile?.addressCity,
          billingAddressState: profile?.addressState,
          locale,
          payFullNow: parsed.payFullNow,
          pricingVersion: PRICING_VERSION,
          touristTaxVersion: TOURIST_TAX_VERSION,
          vatRate: VAT_RATE,
          selectedOptionsSnapshot: pricingSnapshot.selectedOptions,
          pricingSnapshot,
          termsAcceptedAt: new Date(),
          termsVersion: TERMS_VERSION,
          termsLocale: locale,
          termsHash: TERMS_HASH,
          privacyVersion: PRIVACY_VERSION,
          privacyHash: PRIVACY_HASH,
          consentIpAddress: getClientIp(req),
          consentUserAgent: userAgent,
          items: {
            create: optionLines.map((line) => ({
              optionId: line.option.id,
              quantity: line.quantity,
              totalPriceHt: line.totalPriceHt,
              totalPriceHtCents: line.totalPriceHtCents,
            })),
          },
          payments: {
            create: {
              provider: "stripe",
              purpose: parsed.payFullNow ? "FULL" : "DEPOSIT",
              status: "PENDING",
              amountCents: amountDueCents,
              currency: RESERVATION_CURRENCY,
              idempotencyKey: `checkout:${bookingRef}:${
                parsed.payFullNow ? "full" : "deposit"
              }`,
              stripeStatus: "not_created",
            },
          },
          events: {
            create: {
              actorUserId: session.user.id,
              type: "CREATED",
              toStatus: "PENDING_PAYMENT",
              metadata: {
                paymentPurpose: parsed.payFullNow ? "FULL" : "DEPOSIT",
                amountDueCents,
              },
            },
          },
        },
      });

      return reservation.id;
    });

    const reservation = await prisma.reservation.findUniqueOrThrow({
      where: { id: reservationId },
      include: RESERVATION_WITH_ITEMS_INCLUDE,
    });

    return NextResponse.json(serializeReservation(reservation), { status: 201 });
  } catch (error) {
    const message = getErrorMessage(error, "Server error");
    const status = /already reserved/i.test(message) ? 409 : 500;
    console.error(error);
    return NextResponse.json({ error: message }, { status });
  }
}
