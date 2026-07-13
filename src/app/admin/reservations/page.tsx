import Link from "next/link";
import {
  ADMIN_RESERVATION_INCLUDE,
  buildAdminReservationWhere,
} from "@/lib/admin-data";
import { prisma } from "@/lib/prisma";
import { getServerLocale } from "@/components/Language/server-locale";
import {
  adminDateFormatter,
  adminMoneyFormatter,
  paymentStatusLabel,
  reservationStatusLabel,
  tAdmin,
} from "@/components/admin/admin-i18n";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const locale = await getServerLocale();
  const dateFmt = adminDateFormatter(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const money = (cents: number) => adminMoneyFormatter(locale).format(cents / 100);
  const params = await searchParams;
  const q = readParam(params.q);
  const status = readParam(params.status) ?? "all";
  const paymentStatus = readParam(params.paymentStatus) ?? "all";
  const timing = readParam(params.timing) ?? "all";

  const reservations = await prisma.reservation.findMany({
    where: buildAdminReservationWhere({ q, status, paymentStatus, timing }),
    orderBy: { startDate: "desc" },
    take: 100,
    include: ADMIN_RESERVATION_INCLUDE,
  });

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="admin-eyebrow">
            {tAdmin(locale, "administration")}
          </p>
          <h1 className="mt-2 text-3xl">{tAdmin(locale, "reservations")}</h1>
        </div>
        <p className="admin-muted text-sm">
          {tAdmin(locale, "resultsCount", { count: reservations.length })}
        </p>
      </header>

      <form className="admin-surface grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto_auto]">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder={tAdmin(locale, "referenceClientEmailPhone")}
          className="admin-input h-10 rounded-md px-3 text-sm"
        />
        <Select name="timing" defaultValue={timing} options={timingOptions(locale)} />
        <Select name="status" defaultValue={status} options={statusOptions(locale)} />
        <Select
          name="paymentStatus"
          defaultValue={paymentStatus}
          options={paymentOptions(locale)}
        />
        <button className="admin-button h-10 rounded-md px-4 text-sm font-medium">
          {tAdmin(locale, "search")}
        </button>
      </form>

      <section className="admin-surface overflow-hidden">
        <div className="admin-eyebrow hidden grid-cols-[1.2fr_1.4fr_1fr_1fr_1fr_auto] gap-3 border-b border-[var(--admin-line)] bg-[rgba(228,219,206,0.08)] px-4 py-3 lg:grid">
          <span>{tAdmin(locale, "reference")}</span>
          <span>{tAdmin(locale, "client")}</span>
          <span>{tAdmin(locale, "dates")}</span>
          <span>{tAdmin(locale, "status")}</span>
          <span>{tAdmin(locale, "total")}</span>
          <span />
        </div>
        <div className="divide-y divide-[var(--admin-line)]">
          {reservations.map((reservation) => (
            <Link
              key={reservation.id}
              href={`/admin/reservations/${reservation.id}`}
              className="grid gap-2 px-4 py-4 text-sm transition hover:bg-[var(--admin-hover)] lg:grid-cols-[1.2fr_1.4fr_1fr_1fr_1fr_auto] lg:items-center"
            >
              <div>
                <p className="font-semibold">{reservation.bookingRef}</p>
                <p className="admin-muted text-xs">
                  {tAdmin(locale, "createdAt", {
                    date: dateFmt.format(reservation.createdAt),
                  })}
                </p>
              </div>
              <div>
                <p>
                  {customerName(reservation) || tAdmin(locale, "customer")}
                </p>
                <p className="admin-muted break-all text-xs">
                  {reservation.customerEmail ?? reservation.user.email}
                </p>
              </div>
              <p>
                {dateFmt.format(reservation.startDate)} -{" "}
                {dateFmt.format(reservation.endDate)}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge>{reservationStatusLabel(locale, reservation.status)}</Badge>
                <Badge tone="payment">{paymentStatusLabel(locale, reservation.paymentStatus)}</Badge>
              </div>
              <p>{money(reservation.totalAmountTtcCents)}</p>
              <span className="admin-link">{tAdmin(locale, "open")}</span>
            </Link>
          ))}
          {!reservations.length && (
            <p className="admin-muted px-4 py-8 text-center text-sm">
              {tAdmin(locale, "noReservationFound")}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function Select({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="admin-input h-10 rounded-md px-3 text-sm"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function Badge({
  children,
  tone = "status",
}: {
  children: React.ReactNode;
  tone?: "status" | "payment";
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
        tone === "payment"
          ? "admin-pill-blue"
          : "admin-pill"
      }`}
    >
      {children}
    </span>
  );
}

function customerName(reservation: {
  customerFirstName: string | null;
  customerLastName: string | null;
  user: { firstName: string | null; lastName: string | null; name: string | null };
}) {
  return (
    `${reservation.customerFirstName ?? reservation.user.firstName ?? ""} ${
      reservation.customerLastName ?? reservation.user.lastName ?? ""
    }`.trim() || reservation.user.name
  );
}

const timingOptions = (locale: Parameters<typeof tAdmin>[0]) => [
  { value: "all", label: tAdmin(locale, "allDates") },
  { value: "upcoming", label: tAdmin(locale, "upcoming") },
  { value: "past", label: tAdmin(locale, "past") },
];

const statusOptions = (locale: Parameters<typeof tAdmin>[0]) => [
  { value: "all", label: tAdmin(locale, "allStatuses") },
  { value: "PENDING_PAYMENT", label: reservationStatusLabel(locale, "PENDING_PAYMENT") },
  { value: "CONFIRMED", label: reservationStatusLabel(locale, "CONFIRMED") },
  { value: "CANCELLED", label: reservationStatusLabel(locale, "CANCELLED") },
  { value: "EXPIRED", label: reservationStatusLabel(locale, "EXPIRED") },
  { value: "REFUNDED", label: reservationStatusLabel(locale, "REFUNDED") },
];

const paymentOptions = (locale: Parameters<typeof tAdmin>[0]) => [
  { value: "all", label: tAdmin(locale, "allPayments") },
  { value: "UNPAID", label: paymentStatusLabel(locale, "UNPAID") },
  { value: "CHECKOUT_OPEN", label: paymentStatusLabel(locale, "CHECKOUT_OPEN") },
  { value: "PAID_DEPOSIT", label: paymentStatusLabel(locale, "PAID_DEPOSIT") },
  { value: "PAID_FULL", label: paymentStatusLabel(locale, "PAID_FULL") },
  { value: "PAYMENT_FAILED", label: paymentStatusLabel(locale, "PAYMENT_FAILED") },
  { value: "REFUNDED", label: paymentStatusLabel(locale, "REFUNDED") },
];
