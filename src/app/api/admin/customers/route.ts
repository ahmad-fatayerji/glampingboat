import { NextRequest, NextResponse } from "next/server";
import { AdminAccessError, requireAdmin } from "@/lib/admin";
import { getErrorMessage } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const CUSTOMER_LIST_SELECT = {
  id: true,
  email: true,
  name: true,
  avatar: true,
  firstName: true,
  lastName: true,
  phone: true,
  mobile: true,
  birthDate: true,
  addressNumber: true,
  addressStreet: true,
  addressCity: true,
  addressState: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { reservations: true } },
  reservations: {
    orderBy: { startDate: "desc" },
    take: 5,
    select: {
      id: true,
      bookingRef: true,
      status: true,
      paymentStatus: true,
      startDate: true,
      endDate: true,
      totalAmountTtcCents: true,
      paidAmountCents: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} as const;

function serializeCustomer(customer: Awaited<ReturnType<typeof loadCustomers>>[number]) {
  const totalPaidCents = customer.reservations.reduce(
    (sum, reservation) => sum + reservation.paidAmountCents,
    0
  );
  const upcomingReservation = customer.reservations
    .filter((reservation) => reservation.endDate >= new Date())
    .sort((left, right) => left.startDate.getTime() - right.startDate.getTime())[0];

  return {
    ...customer,
    birthDate: customer.birthDate?.toISOString() ?? null,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
    reservationCount: customer._count.reservations,
    totalPaidCents,
    profileComplete: Boolean(
      customer.firstName &&
        customer.lastName &&
        customer.phone &&
        customer.addressCity &&
        customer.addressStreet
    ),
    upcomingReservation: upcomingReservation
      ? {
          id: upcomingReservation.id,
          bookingRef: upcomingReservation.bookingRef,
          startDate: upcomingReservation.startDate.toISOString(),
          endDate: upcomingReservation.endDate.toISOString(),
          status: upcomingReservation.status,
        }
      : null,
    reservations: customer.reservations.map((reservation) => ({
      ...reservation,
      startDate: reservation.startDate.toISOString(),
      endDate: reservation.endDate.toISOString(),
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
    })),
  };
}

function loadCustomers(q: string | null) {
  const search = q?.trim();

  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { mobile: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: CUSTOMER_LIST_SELECT,
  });
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const customers = await loadCustomers(req.nextUrl.searchParams.get("q"));

    return NextResponse.json({ customers: customers.map(serializeCustomer) });
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
