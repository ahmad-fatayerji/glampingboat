import Link from "next/link";
import AdminAvailabilityBlocks from "@/components/admin/AdminAvailabilityBlocks";
import { prisma } from "@/lib/prisma";
import { startOfToday } from "@/lib/admin-data";
import { serializeAvailabilityBlock } from "@/lib/reservations";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function AdminCalendarPage() {
  const today = startOfToday();
  const [reservations, blocks] = await Promise.all([
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
  ]);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm uppercase tracking-[0.24em] text-[#637687]">
          Disponibilite
        </p>
        <h1 className="mt-2 text-3xl">Calendrier</h1>
      </header>

      <section className="border border-[#d9cbb8] bg-white/88 p-4 shadow-[0_10px_30px_rgba(16,43,63,0.08)]">
        <h2 className="mb-3 border-b border-[#d9cbb8] pb-2 text-lg">
          Reservations bloquantes
        </h2>
        <div className="grid gap-2 lg:grid-cols-2">
          {reservations.map((reservation) => (
            <Link
              key={reservation.id}
              href={`/admin/reservations/${reservation.id}`}
              className="rounded-md border border-[#d9cbb8] bg-[#fbf8f3] p-3 text-sm transition hover:border-[#9fb0bb]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{reservation.bookingRef}</span>
                <span className="rounded-full bg-[#dfeaf0] px-2.5 py-1 text-xs">
                  {reservation.status}
                </span>
              </div>
              <p className="mt-1 text-[#637687]">
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
            <p className="text-sm text-[#637687]">Aucune reservation a venir.</p>
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
    </div>
  );
}
