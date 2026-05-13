import { NextRequest, NextResponse } from "next/server";
import { AdminAccessError, requireAdmin } from "@/lib/admin";
import {
  ADMIN_RESERVATION_INCLUDE,
  serializeAdminReservation,
} from "@/lib/admin-data";
import { getErrorMessage } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getString, isRecord } from "@/lib/type-guards";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const reason = isRecord(body) ? getString(body, "reason")?.trim() : "";

    if (!reason) {
      return NextResponse.json({ error: "reason is required" }, { status: 400 });
    }

    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (existing.status !== "CANCELLED") {
        await tx.reservationEvent.create({
          data: {
            reservationId: id,
            actorUserId: session.user.id,
            type: "CANCELLED",
            fromStatus: existing.status,
            toStatus: "CANCELLED",
            metadata: {
              reason,
              source: "admin",
            },
          },
        });
      }

      return tx.reservation.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: existing.cancelledAt ?? new Date(),
          cancellationReason: reason,
        },
        include: ADMIN_RESERVATION_INCLUDE,
      });
    });

    return NextResponse.json({ reservation: serializeAdminReservation(updated) });
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
