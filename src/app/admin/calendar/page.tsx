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
import { Badge, EmptyState, PageHeader, Panel } from "@/components/admin/ui";

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
    <div className="space-y-6">
      <PageHeader
        eyebrow={tAdmin(locale, "availability")}
        title={tAdmin(locale, "calendar")}
      />

      <Panel title={tAdmin(locale, "blockingReservations")}>
        {reservations.length ? (
          <ul className="grid gap-2 lg:grid-cols-2">
            {reservations.map((reservation) => {
              const name =
                reservation.customerFirstName || reservation.customerLastName
                  ? `${reservation.customerFirstName ?? ""} ${
                      reservation.customerLastName ?? ""
                    }`.trim()
                  : reservation.user.email;

              return (
                <li key={reservation.id}>
                  <Link
                    href={`/admin/reservations/${reservation.id}`}
                    className="admin-row flex h-full flex-col gap-2 p-3.5 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0 truncate font-medium">{name}</span>
                      <Badge tone="blue">
                        {reservationStatusLabel(locale, reservation.status)}
                      </Badge>
                    </div>
                    <p className="admin-muted flex flex-wrap items-center gap-x-2 text-xs">
                      <span className="font-mono">{reservation.bookingRef}</span>
                      <span aria-hidden>&middot;</span>
                      <span className="tabular-nums">
                        {dateFmt.format(reservation.startDate)} &ndash;{" "}
                        {dateFmt.format(reservation.endDate)}
                      </span>
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState label={tAdmin(locale, "noFutureReservations")} />
        )}
      </Panel>

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
