import { NextRequest, NextResponse } from "next/server";
import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/http";
import { PROFILE_COMPLETENESS_SELECT, isProfileComplete } from "@/lib/profile";
import {
  generateBookingReference,
  normalizeReservationPricing,
} from "@/lib/reservations";
import { getNumber, getString, getStringArray, isRecord } from "@/lib/type-guards";

function parseReservationPayload(body: unknown) {
  if (!isRecord(body)) {
    return null;
  }

  const pricing = isRecord(body.pricing) ? body.pricing : undefined;

  return {
    startDate: getString(body, "startDate"),
    endDate: getString(body, "endDate"),
    adults: getNumber(body, "adults"),
    children: getNumber(body, "children"),
    optionIds: getStringArray(body, "optionIds"),
    pricing: pricing
      ? {
          basePriceHt: getNumber(pricing, "basePriceHt"),
          optionSumHt: getNumber(pricing, "optionSumHt"),
          subtotalHt: getNumber(pricing, "subtotalHt"),
          tvaHt: getNumber(pricing, "tvaHt"),
          taxSejourTtc: getNumber(pricing, "taxSejourTtc"),
          total: getNumber(pricing, "total"),
        }
      : undefined,
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: PROFILE_COMPLETENESS_SELECT,
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
      return NextResponse.json({ error: "Invalid reservation payload" }, { status: 400 });
    }

    const start = new Date(parsed.startDate);
    const end = new Date(parsed.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
    }

    const normalizedPricing = normalizeReservationPricing(parsed.pricing);
    const reservation = await prisma.reservation.create({
      data: {
        userId: session.user.id,
        bookingRef: await generateBookingReference(prisma),
        startDate: start,
        endDate: end,
        adults: parsed.adults,
        children: parsed.children,
        ...normalizedPricing,
        items: {
          create: parsed.optionIds.map((id) => ({
            optionId: id,
            quantity: 1,
            totalPriceHt: 0,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Server error") },
      { status: 500 }
    );
  }
}
