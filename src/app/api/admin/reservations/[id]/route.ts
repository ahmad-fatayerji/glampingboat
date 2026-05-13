import { NextRequest, NextResponse } from "next/server";
import { AdminAccessError, requireAdmin } from "@/lib/admin";
import {
  ADMIN_RESERVATION_INCLUDE,
  serializeAdminReservation,
} from "@/lib/admin-data";
import { getErrorMessage } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getString, isRecord } from "@/lib/type-guards";

async function loadReservation(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: ADMIN_RESERVATION_INCLUDE,
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const reservation = await loadReservation(id);

    if (!reservation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ reservation: serializeAdminReservation(reservation) });
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const note = isRecord(body) ? getString(body, "internalNote")?.trim() : "";

    if (!note) {
      return NextResponse.json(
        { error: "internalNote is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.reservation.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.reservationEvent.create({
      data: {
        reservationId: id,
        actorUserId: session.user.id,
        type: "ADMIN_NOTE",
        metadata: { note },
      },
    });

    const reservation = await loadReservation(id);
    if (!reservation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ reservation: serializeAdminReservation(reservation) });
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
