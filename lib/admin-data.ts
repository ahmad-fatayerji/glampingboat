import type { Prisma, ReservationPaymentStatus } from "@/generated/prisma/client";
import {
  RESERVATION_WITH_ITEMS_INCLUDE,
  serializeReservation,
} from "@/lib/reservations";

export const ADMIN_RESERVATION_INCLUDE = {
  ...RESERVATION_WITH_ITEMS_INCLUDE,
  user: {
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      phone: true,
      mobile: true,
      createdAt: true,
    },
  },
  events: {
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.ReservationInclude;

export type AdminReservation = Prisma.ReservationGetPayload<{
  include: typeof ADMIN_RESERVATION_INCLUDE;
}>;

export function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function buildAdminReservationWhere(params: {
  q?: string | null;
  status?: string | null;
  paymentStatus?: string | null;
  timing?: string | null;
}) {
  const where: Prisma.ReservationWhereInput = {};
  const today = startOfToday();
  const q = params.q?.trim();

  if (q) {
    where.OR = [
      { bookingRef: { contains: q, mode: "insensitive" } },
      { customerEmail: { contains: q, mode: "insensitive" } },
      { customerFirstName: { contains: q, mode: "insensitive" } },
      { customerLastName: { contains: q, mode: "insensitive" } },
      { customerPhone: { contains: q, mode: "insensitive" } },
      { customerMobile: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { firstName: { contains: q, mode: "insensitive" } } },
      { user: { lastName: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (params.status && params.status !== "all") {
    where.status = params.status as Prisma.EnumReservationStatusFilter["equals"];
  }

  if (params.paymentStatus && params.paymentStatus !== "all") {
    where.paymentStatus =
      params.paymentStatus as Prisma.EnumReservationPaymentStatusFilter["equals"];
  }

  if (params.timing === "upcoming") {
    where.endDate = { gte: today };
  } else if (params.timing === "past") {
    where.endDate = { lt: today };
  }

  return where;
}

export function getReservationPaymentStatus(
  paidAmountCents: number,
  totalAmountCents: number
): ReservationPaymentStatus {
  if (paidAmountCents >= totalAmountCents) {
    return "PAID_FULL";
  }

  if (paidAmountCents > 0) {
    return "PAID_DEPOSIT";
  }

  return "UNPAID";
}

export function serializeAdminReservation(reservation: AdminReservation) {
  return {
    ...serializeReservation(reservation),
    user: {
      ...reservation.user,
      createdAt: reservation.user.createdAt.toISOString(),
    },
    events: reservation.events.map((event) => ({
      ...event,
      createdAt: event.createdAt.toISOString(),
    })),
  };
}
