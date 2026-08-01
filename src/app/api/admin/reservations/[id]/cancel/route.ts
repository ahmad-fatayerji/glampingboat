import { NextRequest, NextResponse } from "next/server";
import { AdminAccessError, requireAdmin } from "@/lib/admin";
import {
  ADMIN_RESERVATION_INCLUDE,
  serializeAdminReservation,
} from "@/lib/admin-data";
import { getErrorMessage } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getString, isRecord } from "@/lib/type-guards";
import {
  cancelReservation,
  ReservationCancellationError,
} from "@/lib/reservation-cancellation";
import { isBalanceOverdue, type CancellationCause } from "@/lib/cancellation-policy";

const CANCELLATION_CAUSES: readonly CancellationCause[] = [
  "CUSTOMER",
  "BALANCE_UNPAID",
  "OWNER_FORCE_MAJEURE",
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const reason = isRecord(body) ? getString(body, "reason")?.trim() : "";
    const cause = (isRecord(body) ? getString(body, "cause") : undefined) as
      | CancellationCause
      | undefined;

    if (!reason) {
      return NextResponse.json({ error: "reason is required" }, { status: 400 });
    }

    if (!cause || !CANCELLATION_CAUSES.includes(cause)) {
      return NextResponse.json(
        {
          error: `cause must be one of ${CANCELLATION_CAUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.reservation.findUnique({
      where: { id },
      select: {
        startDate: true,
        totalAmountTtcCents: true,
        paidAmountCents: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Article 2 lets the owner keep every sum paid, but only once the balance
    // is genuinely overdue. Guard it so the harshest outcome cannot be picked
    // by mistake on a stay that is paid up or still inside its payment window.
    if (
      cause === "BALANCE_UNPAID" &&
      !isBalanceOverdue({
        arrivalDate: existing.startDate,
        now: new Date(),
        totalAmountTtcCents: existing.totalAmountTtcCents,
        paidAmountCents: existing.paidAmountCents,
      })
    ) {
      return NextResponse.json(
        {
          error:
            "The balance is not overdue: article 2 does not apply. Use CUSTOMER or OWNER_FORCE_MAJEURE.",
        },
        { status: 409 }
      );
    }

    const { retention } = await cancelReservation({
      reservationId: id,
      cause,
      reason,
      actorUserId: session.user.id,
      source: "admin",
    });

    const updated = await prisma.reservation.findUniqueOrThrow({
      where: { id },
      include: ADMIN_RESERVATION_INCLUDE,
    });

    return NextResponse.json({
      reservation: serializeAdminReservation(updated),
      cancellation: retention,
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
