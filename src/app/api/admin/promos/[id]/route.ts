import { NextRequest, NextResponse } from "next/server";
import { AdminAccessError, requireAdmin } from "@/lib/admin";
import { getErrorMessage } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeBookingPromo } from "@/lib/reservations";
import { getBoolean, getNumber, getString, isRecord } from "@/lib/type-guards";

function parseDateOnly(value: string) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!parts) return new Date(value);

  return new Date(
    Number.parseInt(parts[1], 10),
    Number.parseInt(parts[2], 10) - 1,
    Number.parseInt(parts[3], 10)
  );
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function parsePatchPayload(body: unknown) {
  if (!isRecord(body)) return null;

  const title = getString(body, "title")?.trim();
  const startDateRaw = getString(body, "startDate");
  const endDateRaw = getString(body, "endDate");
  const nightlyTtc = getNumber(body, "nightlyTtc") ?? getNumber(body, "nightlyRate");
  const isActive = getBoolean(body, "isActive");

  return {
    ...(title ? { title } : {}),
    ...(startDateRaw ? { startDate: startOfDay(parseDateOnly(startDateRaw)) } : {}),
    ...(endDateRaw ? { endDate: startOfDay(parseDateOnly(endDateRaw)) } : {}),
    ...(nightlyTtc !== undefined
      ? { nightlyTtcCents: Math.round(nightlyTtc * 100) }
      : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const patch = parsePatchPayload(await req.json());

    if (!patch || !Object.keys(patch).length) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    const existing = await prisma.bookingPromo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const next = {
      ...existing,
      ...patch,
    };

    if (
      Number.isNaN(next.startDate.getTime()) ||
      Number.isNaN(next.endDate.getTime()) ||
      next.endDate <= next.startDate
    ) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    if (next.nightlyTtcCents <= 0) {
      return NextResponse.json({ error: "Invalid nightly price" }, { status: 400 });
    }

    if (next.isActive) {
      const overlap = await prisma.bookingPromo.findFirst({
        where: {
          id: { not: id },
          isActive: true,
          startDate: { lt: next.endDate },
          endDate: { gt: next.startDate },
        },
        select: { id: true, title: true },
      });

      if (overlap) {
        return NextResponse.json(
          { error: `Dates overlap active promo ${overlap.title}` },
          { status: 409 }
        );
      }
    }

    const promo = await prisma.bookingPromo.update({
      where: { id },
      data: patch,
    });

    return NextResponse.json({ promo: serializeBookingPromo(promo) });
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.bookingPromo.delete({ where: { id } });

    return NextResponse.json({ ok: true });
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
