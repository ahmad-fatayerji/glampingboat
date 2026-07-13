import Link from "next/link";
import AdminAvailabilityBlocks from "@/components/admin/AdminAvailabilityBlocks";
import AdminBookingPromos from "@/components/admin/AdminBookingPromos";
import { prisma } from "@/lib/prisma";
import { startOfToday } from "@/lib/admin-data";
import { serializeAvailabilityBlock, serializeBookingPromo } from "@/lib/reservations";
import { getServerLocale } from "@/components/Language/server-locale";
import {
  adminDateFormatter,
  reservationStatusLabel,
  tAdmin,
} from "@/components/admin/admin-i18n";

export const dynamic = "force-dynamic";

export default async function AdminCalendarPage() {
  const locale = await getServerLocale();
  const dateFmt = adminDateFormatter(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const today = startOfToday();
  const [reservations, blocks, promos] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        status: { in: ["PENDING_PAYMENT", "CONFIRMED"] },
        endDate: { gte: today },
      },
      orderBy: { startDate: "asc" },
      take: 60,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    }),
    prisma.availabilityBlock.findMany({
      where: { endDate: { gte: today } },
      orderBy: { startDate: "asc" },
      take: 100,
    }),
    prisma.bookingPromo.findMany({
      orderBy: { startDate: "asc" },
      take: 200,
    }),
  ]);

  return (
    <div className="space-y-5">
      <header>
        <p className="admin-eyebrow">
          {tAdmin(locale, "availability")}
        </p>
        <h1 className="mt-2 text-3xl">{tAdmin(locale, "calendar")}</h1>
      </header>

      <section className="admin-surface p-4">
        <h2 className="mb-3 border-b border-[var(--admin-line)] pb-2 text-lg">
          {tAdmin(locale, "blockingReservations")}
        </h2>
        <div className="grid gap-2 lg:grid-cols-2">
          {reservations.map((reservation) => (
            <Link
              key={reservation.id}
              href={`/admin/reservations/${reservation.id}`}
              className="admin-row rounded-md p-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{reservation.bookingRef}</span>
                <span className="admin-pill-blue rounded-full px-2.5 py-1 text-xs">
                  {reservationStatusLabel(locale, reservation.status)}
                </span>
              </div>
              <p className="admin-muted mt-1">
                {dateFmt.format(reservation.startDate)} -{" "}
                {dateFmt.format(reservation.endDate)}
              </p>
              <p className="mt-1">
                {reservation.customerFirstName || reservation.customerLastName
                  ? `${reservation.customerFirstName ?? ""} ${
                      reservation.customerLastName ?? ""
                    }`.trim()
                  : reservation.user.email}
              </p>
            </Link>
          ))}
          {!reservations.length && (
            <p className="admin-muted text-sm">{tAdmin(locale, "noFutureReservations")}</p>
          )}
        </div>
      </section>

      <AdminAvailabilityBlocks
        blocks={blocks.map((block) => {
          const serialized = serializeAvailabilityBlock(block);
          return {
            ...serialized,
            startDate: String(serialized.startDate),
            endDate: String(serialized.endDate),
            createdAt: String(serialized.createdAt),
            updatedAt: String(serialized.updatedAt),
          };
        })}
      />

      <AdminBookingPromos
        promos={promos.map((promo) => {
          const serialized = serializeBookingPromo(promo);
          return {
            ...serialized,
            startDate: String(serialized.startDate),
            endDate: String(serialized.endDate),
            createdAt: String(serialized.createdAt),
            updatedAt: String(serialized.updatedAt),
          };
        })}
      />
    </div>
  );
}
