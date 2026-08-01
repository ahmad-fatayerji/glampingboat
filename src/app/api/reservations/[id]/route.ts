import { NextRequest, NextResponse } from "next/server";
import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/http";
import {
  cancelReservation,
  ReservationCancellationError,
} from "@/lib/reservation-cancellation";
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
    // Article 9, annulation par le locataire. The retention scale is applied by
    // cancelReservation; anything owed back is parked in REFUND_PENDING for the
    // owner to release rather than refunded automatically.
    const { retention } = await cancelReservation({
      reservationId: id,
      cause: "CUSTOMER",
      reason: "Cancelled by customer",
      actorUserId: session.user.id,
      source: "customer",
      expectedUserId: session.user.id,
    });

    const updated = await prisma.reservation.findUniqueOrThrow({
      where: { id },
      include: RESERVATION_WITH_ITEMS_INCLUDE,
    });

    return NextResponse.json({
      ...serializeReservation(updated),
      cancellation: {
        tier: retention.tier,
        retainedCents: retention.retainedCents,
        refundableCents: retention.refundableCents,
        outstandingCents: retention.outstandingCents,
        policyVersion: retention.policyVersion,
      },
    });
  } catch (error) {
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
