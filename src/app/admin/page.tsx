import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { startOfToday } from "@/lib/admin-data";
import { getServerLocale } from "@/components/Language/server-locale";
import type { Locale } from "@/components/Language/dictionaries";
import {
  adminDateFormatter,
  adminMoneyFormatter,
  paymentStatusLabel,
  reservationStatusLabel,
  tAdmin,
} from "@/components/admin/admin-i18n";
import { Badge, EmptyState, Metric, PageHeader, Panel } from "@/components/admin/ui";
import {
  IconBan,
  IconCalendar,
  IconCoins,
  IconWallet,
} from "@/components/admin/icons";

export const dynamic = "force-dynamic";

const reservationSelect = {
  id: true,
  bookingRef: true,
  startDate: true,
  endDate: true,
  customerFirstName: true,
  customerLastName: true,
  customerEmail: true,
  totalAmountTtcCents: true,
  status: true,
  paymentStatus: true,
} as const;

export default async function AdminDashboardPage() {
  const locale = await getServerLocale();
  const money = (cents: number) => adminMoneyFormatter(locale).format(cents / 100);
  const dateFmt = adminDateFormatter(locale, { day: "2-digit", month: "short" });
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
      take: 6,
      select: reservationSelect,
    }),
    prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: reservationSelect,
    }),
    prisma.availabilityBlock.findMany({
      where: { endDate: { gte: today } },
      orderBy: { startDate: "asc" },
      take: 6,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={tAdmin(locale, "operations")} title={tAdmin(locale, "dashboard")} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label={tAdmin(locale, "upcomingReservations")}
          value={String(upcomingCount)}
          icon={<IconCalendar />}
        />
        <Metric
          label={tAdmin(locale, "paymentsToFollow")}
          value={String(pendingPaymentCount)}
          icon={<IconWallet />}
          tone={pendingPaymentCount > 0 ? "warn" : undefined}
        />
        <Metric
          label={tAdmin(locale, "unpaidBalance")}
          value={money(unpaidBalances._sum.balanceAmountCents ?? 0)}
          icon={<IconCoins />}
        />
        <Metric
          label={tAdmin(locale, "cancelledReservations")}
          value={String(cancelledCount)}
          icon={<IconBan />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel
          title={tAdmin(locale, "arrivalsNext7Days")}
          href="/admin/reservations?timing=upcoming"
          openLabel={tAdmin(locale, "open")}
        >
          <ReservationRows
            locale={locale}
            reservations={upcomingReservations}
            empty={tAdmin(locale, "noNearbyArrivals")}
            dateFmt={dateFmt}
            money={money}
            fallbackCustomer={tAdmin(locale, "customer")}
          />
        </Panel>
        <Panel
          title={tAdmin(locale, "recentReservations")}
          href="/admin/reservations"
          openLabel={tAdmin(locale, "open")}
        >
          <ReservationRows
            locale={locale}
            reservations={recentReservations}
            empty={tAdmin(locale, "noReservation")}
            dateFmt={dateFmt}
            money={money}
            fallbackCustomer={tAdmin(locale, "customer")}
          />
        </Panel>
      </section>

      <Panel
        title={tAdmin(locale, "blocks")}
        href="/admin/calendar"
        openLabel={tAdmin(locale, "open")}
      >
        {blocks.length ? (
          <ul className="grid gap-2">
            {blocks.map((block) => (
              <li
                key={block.id}
                className="admin-row flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3.5 py-3 text-sm"
              >
                <span className="font-medium">{block.reason}</span>
                <span className="admin-muted tabular-nums">
                  {dateFmt.format(block.startDate)} &ndash; {dateFmt.format(block.endDate)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState label={tAdmin(locale, "noActiveBlocks")} />
        )}
      </Panel>
    </div>
  );
}

function ReservationRows({
  locale,
  reservations,
  empty,
  dateFmt,
  money,
  fallbackCustomer,
}: {
  locale: Locale;
  reservations: Array<{
    id: string;
    bookingRef: string;
    startDate: Date;
    endDate: Date;
    customerFirstName: string | null;
    customerLastName: string | null;
    customerEmail: string | null;
    totalAmountTtcCents: number;
    status: string;
    paymentStatus: string;
  }>;
  empty: string;
  dateFmt: Intl.DateTimeFormat;
  money: (cents: number) => string;
  fallbackCustomer: string;
}) {
  if (!reservations.length) {
    return <EmptyState label={empty} />;
  }

  return (
    <ul className="grid gap-2">
      {reservations.map((reservation) => {
        const name =
          reservation.customerFirstName || reservation.customerLastName
            ? `${reservation.customerFirstName ?? ""} ${reservation.customerLastName ?? ""}`.trim()
            : reservation.customerEmail ?? fallbackCustomer;
        const cancelled =
          reservation.status === "CANCELLED" ||
          reservation.status === "EXPIRED" ||
          reservation.status === "REFUNDED";
        const paid = reservation.paymentStatus === "PAID_FULL";

        return (
          <li key={reservation.id}>
            <Link
              href={`/admin/reservations/${reservation.id}`}
              className="admin-row flex flex-col gap-2 px-3.5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{name}</p>
                <p className="admin-muted mt-0.5 flex flex-wrap items-center gap-x-2 text-xs">
                  <span className="font-mono">{reservation.bookingRef}</span>
                  <span aria-hidden>&middot;</span>
                  <span className="tabular-nums">
                    {dateFmt.format(reservation.startDate)} &ndash;{" "}
                    {dateFmt.format(reservation.endDate)}
                  </span>
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <Badge tone={cancelled ? "neutral" : paid ? "ok" : "warn"}>
                  {cancelled
                    ? reservationStatusLabel(locale, reservation.status)
                    : paymentStatusLabel(locale, reservation.paymentStatus)}
                </Badge>
                <span className="shrink-0 font-medium tabular-nums">
                  {money(reservation.totalAmountTtcCents)}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
