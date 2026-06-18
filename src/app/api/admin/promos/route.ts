import { NextRequest, NextResponse } from "next/server";
import { AdminAccessError, requireAdmin } from "@/lib/admin";
import { getErrorMessage } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeBookingPromo } from "@/lib/reservations";
import { getBoolean, getNumber, getString, isRecord } from "@/lib/type-guards";

function parseDateOnly(value: string) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!parts) return new Date(value);

  return new Date(
    Number.parseInt(parts[1], 10),
    Number.parseInt(parts[2], 10) - 1,
    Number.parseInt(parts[3], 10)
  );
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function parsePromoPayload(body: unknown) {
  if (!isRecord(body)) return null;

  const title = getString(body, "title")?.trim();
  const startDateRaw = getString(body, "startDate");
  const endDateRaw = getString(body, "endDate");
  const nightlyTtc =
    getNumber(body, "nightlyTtc") ?? getNumber(body, "nightlyRate") ?? 195;
  const isActive = getBoolean(body, "isActive") ?? true;

  if (!title || !startDateRaw || !endDateRaw) return null;

  return {
    title,
    startDate: startOfDay(parseDateOnly(startDateRaw)),
    endDate: startOfDay(parseDateOnly(endDateRaw)),
    nightlyTtcCents: Math.round(nightlyTtc * 100),
    isActive,
  };
}

export async function GET() {
  try {
    await requireAdmin();
    const promos = await prisma.bookingPromo.findMany({
      orderBy: { startDate: "asc" },
      take: 200,
    });

    return NextResponse.json({ promos: promos.map(serializeBookingPromo) });
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Server error") },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const parsed = parsePromoPayload(await req.json());

    if (!parsed) {
      return NextResponse.json(
        { error: "title, startDate and endDate are required" },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(parsed.startDate.getTime()) ||
      Number.isNaN(parsed.endDate.getTime()) ||
      parsed.endDate <= parsed.startDate
    ) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    if (parsed.nightlyTtcCents <= 0) {
      return NextResponse.json({ error: "Invalid nightly price" }, { status: 400 });
    }

    if (parsed.isActive) {
      const overlap = await prisma.bookingPromo.findFirst({
        where: {
          isActive: true,
          startDate: { lt: parsed.endDate },
          endDate: { gt: parsed.startDate },
        },
        select: { id: true, title: true },
      });

      if (overlap) {
        return NextResponse.json(
          { error: `Dates overlap active promo ${overlap.title}` },
          { status: 409 }
        );
      }
    }

    const promo = await prisma.bookingPromo.create({
      data: {
        ...parsed,
        actorUserId: session.user.id,
      },
    });

    return NextResponse.json(
      { promo: serializeBookingPromo(promo) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Server error") },
      { status: 500 }
    );
  }
}
