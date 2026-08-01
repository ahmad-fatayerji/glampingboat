import { NextRequest, NextResponse } from "next/server";
import { AdminAccessError, requireAdmin } from "@/lib/admin";
import {
  ADMIN_RESERVATION_INCLUDE,
  serializeAdminReservation,
} from "@/lib/admin-data";
import { getErrorMessage } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getNumber, isRecord } from "@/lib/type-guards";
import {
  refundReservation,
  ReservationCancellationError,
} from "@/lib/reservation-cancellation";

/**
 * Release the refund owed on a cancelled reservation.
 *
 * The amount is bounded by what article 9 leaves refundable after retention;
 * `refundReservation` rejects anything above it. Omit `amountCents` to refund
 * the full outstanding balance.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    let amountCents: number | undefined;
    try {
      const body = await req.json();
      amountCents = isRecord(body)
        ? getNumber(body, "amountCents") ?? undefined
        : undefined;
    } catch {
      // An empty body means "refund everything owed".
    }

    const { refunds, refundedCents } = await refundReservation({
      reservationId: id,
      actorUserId: session.user.id,
      amountCents,
    });

    const updated = await prisma.reservation.findUniqueOrThrow({
      where: { id },
      include: ADMIN_RESERVATION_INCLUDE,
    });

    return NextResponse.json({
      reservation: serializeAdminReservation(updated),
      refundedCents,
      refunds,
    });
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ReservationCancellationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Server error") },
      { status: 500 }
    );
  }
}
