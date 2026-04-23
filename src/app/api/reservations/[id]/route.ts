import { NextRequest, NextResponse } from "next/server";
import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/http";
import {
  RESERVATION_WITH_ITEMS_INCLUDE,
  serializeReservation,
} from "@/lib/reservations";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation || reservation.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (reservation.status === "CANCELLED") {
      const existing = await prisma.reservation.findUnique({
        where: { id },
        include: RESERVATION_WITH_ITEMS_INCLUDE,
      });
      return NextResponse.json(existing ? serializeReservation(existing) : { ok: true });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.reservationEvent.create({
        data: {
          reservationId: id,
          actorUserId: session.user.id,
          type: "CANCELLED",
          fromStatus: reservation.status,
          toStatus: "CANCELLED",
          metadata: {
            reason: "user_cancelled_before_live_stripe",
          },
        },
      });

      return tx.reservation.update({
        where: { id },
        data: {
          status: "CANCELLED",
          paymentStatus:
            reservation.paymentStatus === "REFUNDED"
              ? "REFUNDED"
              : "UNPAID",
          cancelledAt: new Date(),
          cancellationReason: "user_cancelled_before_live_stripe",
        },
        include: RESERVATION_WITH_ITEMS_INCLUDE,
      });
    });

    return NextResponse.json(serializeReservation(updated));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Server error") },
      { status: 500 }
    );
  }
}
