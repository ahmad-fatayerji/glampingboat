import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { startOfToday } from "@/lib/admin-data";

const money = (cents: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function AdminDashboardPage() {
  const today = startOfToday();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const [
    upcomingCount,
    pendingPaymentCount,
    cancelledCount,
    unpaidBalances,
    upcomingReservations,
    recentReservations,
    blocks,
  ] = await Promise.all([
    prisma.reservation.count({
      where: { status: { in: ["PENDING_PAYMENT", "CONFIRMED"] }, endDate: { gte: today } },
    }),
    prisma.reservation.count({
      where: {
        status: { in: ["PENDING_PAYMENT", "CONFIRMED"] },
        paymentStatus: { in: ["UNPAID", "CHECKOUT_OPEN", "PAYMENT_FAILED", "PAID_DEPOSIT"] },
      },
    }),
    prisma.reservation.count({ where: { status: "CANCELLED" } }),
    prisma.reservation.aggregate({
      where: { paymentStatus: "PAID_DEPOSIT" },
      _sum: { balanceAmountCents: true },
    }),
    prisma.reservation.findMany({
      where: {
        status: { in: ["PENDING_PAYMENT", "CONFIRMED"] },
        startDate: { gte: today, lt: nextWeek },
      },
      orderBy: { startDate: "asc" },
      take: 8,
      include: { user: { select: { email: true } } },
    }),
    prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { email: true } } },
    }),
    prisma.availabilityBlock.findMany({
      where: { endDate: { gte: today } },
      orderBy: { startDate: "asc" },
      take: 6,
    }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="admin-eyebrow">
          Operations
        </p>
        <h1 className="mt-2 text-3xl">Tableau de bord</h1>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Reservations a venir" value={String(upcomingCount)} />
        <Metric label="Paiements a suivre" value={String(pendingPaymentCount)} />
        <Metric label="Solde restant" value={money(unpaidBalances._sum.balanceAmountCents ?? 0)} />
        <Metric label="Annulees" value={String(cancelledCount)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel title="Arrivees des 7 prochains jours" href="/admin/reservations?timing=upcoming">
          <ReservationRows reservations={upcomingReservations} empty="Aucune arrivee proche." />
        </Panel>
        <Panel title="Reservations recentes" href="/admin/reservations">
          <ReservationRows reservations={recentReservations} empty="Aucune reservation." />
        </Panel>
      </section>

      <Panel title="Blocages du calendrier" href="/admin/calendar">
        {blocks.length ? (
          <div className="grid gap-2">
            {blocks.map((block) => (
              <div
                key={block.id}
                className="admin-row grid gap-1 rounded-md px-3 py-2 text-sm md:grid-cols-[1fr_auto]"
              >
                <span>{block.reason}</span>
                <span className="admin-muted">
                  {dateFmt.format(block.startDate)} - {dateFmt.format(block.endDate)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="admin-muted text-sm">Aucun blocage actif.</p>
        )}
      </Panel>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-surface p-4">
      <p className="admin-eyebrow">{label}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Panel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-[var(--admin-line)] pb-2">
        <h2 className="text-lg">{title}</h2>
        <Link href={href} className="admin-link text-sm">
          Ouvrir
        </Link>
      </div>
      {children}
    </section>
  );
}

function ReservationRows({
  reservations,
  empty,
}: {
  reservations: Array<{
    id: string;
    bookingRef: string;
    startDate: Date;
    endDate: Date;
    customerFirstName: string | null;
    customerLastName: string | null;
    customerEmail: string | null;
    totalAmountTtcCents: number;
  }>;
  empty: string;
}) {
  if (!reservations.length) {
    return <p className="admin-muted text-sm">{empty}</p>;
  }

  return (
    <div className="grid gap-2">
      {reservations.map((reservation) => (
        <Link
          key={reservation.id}
          href={`/admin/reservations/${reservation.id}`}
          className="admin-row grid gap-1 rounded-md px-3 py-2 text-sm md:grid-cols-[1fr_auto_auto]"
        >
          <span>
            {reservation.bookingRef} -{" "}
            {reservation.customerFirstName || reservation.customerLastName
              ? `${reservation.customerFirstName ?? ""} ${reservation.customerLastName ?? ""}`.trim()
              : reservation.customerEmail ?? "Client"}
          </span>
          <span className="admin-muted">
            {dateFmt.format(reservation.startDate)} - {dateFmt.format(reservation.endDate)}
          </span>
          <span>{money(reservation.totalAmountTtcCents)}</span>
        </Link>
      ))}
    </div>
  );
}
