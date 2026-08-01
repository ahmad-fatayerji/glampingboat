import { NextRequest, NextResponse } from "next/server";
import { AdminAccessError, requireAdmin } from "@/lib/admin";
import { getErrorMessage } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import {
  buildActiveReservationOverlapWhere,
  buildAvailabilityBlockOverlapWhere,
  isOverlapConstraintViolation,
  lockCalendar,
  serializeAvailabilityBlock,
} from "@/lib/reservations";
import { getString, isRecord } from "@/lib/type-guards";
import type { AvailabilityBlockType } from "@/generated/prisma/client";

/** Thrown inside the calendar transaction to roll it back with a 409. */
class AvailabilityConflictError extends Error {}

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

    // Check and insert under the shared calendar lock. Previously these ran
    // outside any transaction, so a booking could commit between the check and
    // the insert and both would claim the same nights.
    const block = await prisma.$transaction(async (tx) => {
      await lockCalendar(tx);

      const [reservationOverlap, blockOverlap] = await Promise.all([
        tx.reservation.findFirst({
          where: buildActiveReservationOverlapWhere(startDate, endDate),
          select: { id: true, bookingRef: true },
        }),
        tx.availabilityBlock.findFirst({
          where: buildAvailabilityBlockOverlapWhere(startDate, endDate),
          select: { id: true },
        }),
      ]);

      if (reservationOverlap) {
        throw new AvailabilityConflictError(
          `Dates overlap reservation ${reservationOverlap.bookingRef}`
        );
      }

      if (blockOverlap) {
        throw new AvailabilityConflictError(
          "Dates overlap an existing availability block"
        );
      }

      return tx.availabilityBlock.create({
        data: {
          startDate,
          endDate,
          reason,
          note: note || null,
          type,
          actorUserId: session.user.id,
        },
      });
    });

    return NextResponse.json(
      { block: serializeAvailabilityBlock(block) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof AvailabilityConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    // The AvailabilityBlock_no_overlap exclusion constraint is the backstop if
    // a writer ever reaches the insert without the calendar lock.
    if (isOverlapConstraintViolation(error)) {
      return NextResponse.json(
        { error: "Dates overlap an existing availability block" },
        { status: 409 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Server error") },
      { status: 500 }
    );
  }
}
