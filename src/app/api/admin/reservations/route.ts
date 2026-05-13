import { NextRequest, NextResponse } from "next/server";
import { AdminAccessError, requireAdmin } from "@/lib/admin";
import {
  ADMIN_RESERVATION_INCLUDE,
  buildAdminReservationWhere,
  serializeAdminReservation,
} from "@/lib/admin-data";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/http";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const reservations = await prisma.reservation.findMany({
      where: buildAdminReservationWhere({
        q: req.nextUrl.searchParams.get("q"),
        status: req.nextUrl.searchParams.get("status"),
        paymentStatus: req.nextUrl.searchParams.get("paymentStatus"),
        timing: req.nextUrl.searchParams.get("timing"),
      }),
      orderBy: { startDate: "desc" },
      take: 100,
      include: ADMIN_RESERVATION_INCLUDE,
    });

    return NextResponse.json({
      reservations: reservations.map(serializeAdminReservation),
    });
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
