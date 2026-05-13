import { NextRequest, NextResponse } from "next/server";
import type { BookingPaymentPurpose } from "@/generated/prisma/client";
import { AdminAccessError, requireAdmin } from "@/lib/admin";
import {
  ADMIN_RESERVATION_INCLUDE,
  getReservationPaymentStatus,
  serializeAdminReservation,
} from "@/lib/admin-data";
import { getErrorMessage } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getNumber, getString, isRecord } from "@/lib/type-guards";

const MANUAL_PAYMENT_PURPOSES: readonly BookingPaymentPurpose[] = [
  "DEPOSIT",
  "BALANCE",
  "FULL",
  "SECURITY_DEPOSIT",
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    if (!isRecord(body)) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const amountCents =
      getNumber(body, "amountCents") ??
      Math.round((getNumber(body, "amount") ?? 0) * 100);
    const purpose = getString(body, "purpose") as BookingPaymentPurpose | undefined;
    const note = getString(body, "note")?.trim() ?? "";

    if (!purpose || !MANUAL_PAYMENT_PURPOSES.includes(purpose)) {
      return NextResponse.json({ error: "Invalid payment purpose" }, { status: 400 });
    }

    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const existing = await prisma.reservation.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        totalAmountTtcCents: true,
        paidAmountCents: true,
        currency: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot record payment on a cancelled reservation" },
        { status: 409 }
      );
    }

    const countsTowardBookingTotal = purpose !== "SECURITY_DEPOSIT";
    const paidAmountCents = countsTowardBookingTotal
      ? Math.min(existing.totalAmountTtcCents, existing.paidAmountCents + amountCents)
      : existing.paidAmountCents;
    const paymentStatus = countsTowardBookingTotal
      ? getReservationPaymentStatus(paidAmountCents, existing.totalAmountTtcCents)
      : existing.paymentStatus;

    const updated = await prisma.$transaction(async (tx) => {
      const payment = await tx.bookingPayment.create({
        data: {
          reservationId: id,
          provider: "manual",
          purpose,
          status: "PAID",
          amountCents,
          currency: existing.currency,
          stripeStatus: "manual",
          stripePayload: {
            source: "admin",
            note: note || null,
            recordedByUserId: session.user.id,
          },
          paidAt: new Date(),
        },
      });

      await tx.reservation.update({
        where: { id },
        data: {
          status: countsTowardBookingTotal ? "CONFIRMED" : existing.status,
          paymentStatus,
          paidAmountCents,
        },
      });

      await tx.reservationEvent.create({
        data: {
          reservationId: id,
          actorUserId: session.user.id,
          type: "MANUAL_PAYMENT_RECORDED",
          metadata: {
            paymentId: payment.id,
            purpose,
            amountCents,
            currency: existing.currency,
            note: note || null,
            paidAmountCents,
          },
        },
      });

      return tx.reservation.findUniqueOrThrow({
        where: { id },
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
