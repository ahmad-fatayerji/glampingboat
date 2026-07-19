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
import { Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { IconSearch } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

const COLUMNS = "lg:grid-cols-[1.1fr_1.5fr_1.2fr_1.3fr_0.8fr_auto]";

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
  const shortDateFmt = adminDateFormatter(locale, { day: "2-digit", month: "short" });
  const money = (cents: number) => adminMoneyFormatter(locale).format(cents / 100);
  const params = await searchParams;
  const q = readParam(params.q);
  const status = readParam(params.status) ?? "all";
  const paymentStatus = readParam(params.paymentStatus) ?? "all";
  const timing = readParam(params.timing) ?? "all";
  const isFiltered =
    Boolean(q?.trim()) || status !== "all" || paymentStatus !== "all" || timing !== "all";

  const reservations = await prisma.reservation.findMany({
    where: buildAdminReservationWhere({ q, status, paymentStatus, timing }),
    orderBy: { startDate: "desc" },
    take: 100,
    include: ADMIN_RESERVATION_INCLUDE,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={tAdmin(locale, "administration")}
        title={tAdmin(locale, "reservations")}
        actions={
          <span className="admin-muted self-center text-sm tabular-nums">
            {tAdmin(locale, "resultsCount", { count: reservations.length })}
          </span>
        }
      />

      <form className="admin-surface grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_1fr_auto] xl:items-end">
        <Field label={tAdmin(locale, "search")}>
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder={tAdmin(locale, "referenceClientEmailPhone")}
            className="admin-input h-10 px-3 text-sm"
          />
        </Field>
        <Field label={tAdmin(locale, "dates")}>
          <Select name="timing" defaultValue={timing} options={timingOptions(locale)} />
        </Field>
        <Field label={tAdmin(locale, "status")}>
          <Select name="status" defaultValue={status} options={statusOptions(locale)} />
        </Field>
        <Field label={tAdmin(locale, "payments")}>
          <Select
            name="paymentStatus"
            defaultValue={paymentStatus}
            options={paymentOptions(locale)}
          />
        </Field>
        <div className="flex gap-2">
          <button className="admin-button h-10 flex-1 px-4 text-sm font-medium xl:flex-none">
            <IconSearch className="text-[0.95em]" />
            {tAdmin(locale, "search")}
          </button>
          {isFiltered ? (
            <Link
              href="/admin/reservations"
              className="admin-button-secondary h-10 px-4 text-sm font-medium"
            >
              &times;
            </Link>
          ) : null}
        </div>
      </form>

      <section className="admin-surface overflow-hidden">
        <div
          className={`admin-eyebrow admin-table-head hidden gap-3 border-b border-[var(--admin-line)] px-4 py-3 lg:grid ${COLUMNS}`}
        >
          <span>{tAdmin(locale, "reference")}</span>
          <span>{tAdmin(locale, "client")}</span>
          <span>{tAdmin(locale, "dates")}</span>
          <span>{tAdmin(locale, "status")}</span>
          <span className="text-right">{tAdmin(locale, "total")}</span>
          <span className="sr-only">{tAdmin(locale, "open")}</span>
        </div>
        <div className="divide-y divide-[var(--admin-line)]">
          {reservations.map((reservation) => (
            <Link
              key={reservation.id}
              href={`/admin/reservations/${reservation.id}`}
              className={`group grid gap-x-3 gap-y-2 px-4 py-3.5 text-sm transition hover:bg-[var(--admin-hover)] lg:items-center ${COLUMNS}`}
            >
              <div className="min-w-0">
                <p className="truncate font-mono font-medium">{reservation.bookingRef}</p>
                <p className="admin-muted mt-0.5 text-xs">
                  {tAdmin(locale, "createdAt", {
                    date: shortDateFmt.format(reservation.createdAt),
                  })}
                </p>
              </div>
              <div className="min-w-0">
                <p className="truncate">
                  {customerName(reservation) || tAdmin(locale, "customer")}
                </p>
                <p className="admin-muted truncate text-xs">
                  {reservation.customerEmail ?? reservation.user.email}
                </p>
              </div>
              <p className="tabular-nums">
                {dateFmt.format(reservation.startDate)}
                <span className="admin-muted"> &ndash; </span>
                {dateFmt.format(reservation.endDate)}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge>{reservationStatusLabel(locale, reservation.status)}</Badge>
                <Badge tone={reservation.paymentStatus === "PAID_FULL" ? "ok" : "blue"}>
                  {paymentStatusLabel(locale, reservation.paymentStatus)}
                </Badge>
              </div>
              <p className="font-medium tabular-nums lg:text-right">
                {money(reservation.totalAmountTtcCents)}
              </p>
              <span className="admin-link hidden text-sm lg:inline">
                {tAdmin(locale, "open")}
              </span>
            </Link>
          ))}
          {!reservations.length && (
            <div className="p-5">
              <EmptyState label={tAdmin(locale, "noReservationFound")} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="admin-eyebrow">{label}</span>
      {children}
    </label>
  );
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
    <select name={name} defaultValue={defaultValue} className="admin-input h-10 px-3 text-sm">
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
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
