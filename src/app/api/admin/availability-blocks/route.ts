import { NextRequest, NextResponse } from "next/server";
import { AdminAccessError, requireAdmin } from "@/lib/admin";
import { getErrorMessage } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import {
  buildActiveReservationOverlapWhere,
  buildAvailabilityBlockOverlapWhere,
  serializeAvailabilityBlock,
} from "@/lib/reservations";
import { getString, isRecord } from "@/lib/type-guards";
import type { AvailabilityBlockType } from "@/generated/prisma/client";

const BLOCK_TYPES: readonly AvailabilityBlockType[] = [
  "MAINTENANCE",
  "OWNER_USE",
  "CLEANING_BUFFER",
  "PRIVATE_HOLD",
  "OTHER",
];

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

export async function GET() {
  try {
    await requireAdmin();
    const blocks = await prisma.availabilityBlock.findMany({
      orderBy: { startDate: "desc" },
      take: 200,
    });

    return NextResponse.json({ blocks: blocks.map(serializeAvailabilityBlock) });
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
    const body = await req.json();

    if (!isRecord(body)) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const startDateRaw = getString(body, "startDate");
    const endDateRaw = getString(body, "endDate");
    const reason = getString(body, "reason")?.trim();
    const note = getString(body, "note")?.trim();
    const typeRaw = getString(body, "type") as AvailabilityBlockType | undefined;
    const type = typeRaw && BLOCK_TYPES.includes(typeRaw) ? typeRaw : "OTHER";

    if (!startDateRaw || !endDateRaw || !reason) {
      return NextResponse.json(
        { error: "startDate, endDate and reason are required" },
        { status: 400 }
      );
    }

    const startDate = startOfDay(parseDateOnly(startDateRaw));
    const endDate = startOfDay(parseDateOnly(endDateRaw));
    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    const [reservationOverlap, blockOverlap] = await Promise.all([
      prisma.reservation.findFirst({
        where: buildActiveReservationOverlapWhere(startDate, endDate),
        select: { id: true, bookingRef: true },
      }),
      prisma.availabilityBlock.findFirst({
        where: buildAvailabilityBlockOverlapWhere(startDate, endDate),
        select: { id: true },
      }),
    ]);

    if (reservationOverlap) {
      return NextResponse.json(
        { error: `Dates overlap reservation ${reservationOverlap.bookingRef}` },
        { status: 409 }
      );
    }

    if (blockOverlap) {
      return NextResponse.json(
        { error: "Dates overlap an existing availability block" },
        { status: 409 }
      );
    }

    const block = await prisma.availabilityBlock.create({
      data: {
        startDate,
        endDate,
        reason,
        note: note || null,
        type,
        actorUserId: session.user.id,
      },
    });

    return NextResponse.json(
      { block: serializeAvailabilityBlock(block) },
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
