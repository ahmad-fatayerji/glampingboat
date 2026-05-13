import { NextRequest, NextResponse } from "next/server";
import { AdminAccessError, requireAdmin } from "@/lib/admin";
import { getErrorMessage } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import {
  RESERVATION_WITH_ITEMS_INCLUDE,
  serializeReservation,
} from "@/lib/reservations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const customer = await prisma.user.findUnique({
      where: { id },
      select: {
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
        reservations: {
          orderBy: { startDate: "desc" },
          include: RESERVATION_WITH_ITEMS_INCLUDE,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      customer: {
        ...customer,
        birthDate: customer.birthDate?.toISOString() ?? null,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
        reservations: customer.reservations.map(serializeReservation),
      },
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
