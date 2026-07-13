import Link from "next/link";
import { notFound } from "next/navigation";
import AdminReservationActions from "@/components/admin/AdminReservationActions";
import { SHOW_TOURIST_TAX_BREAKDOWN } from "@/lib/booking-features";
import { ADMIN_RESERVATION_INCLUDE } from "@/lib/admin-data";
import { prisma } from "@/lib/prisma";
import { getServerLocale } from "@/components/Language/server-locale";
import {
  adminDateFormatter,
  adminMoneyFormatter,
  paymentPurposeLabel,
  paymentStatusLabel,
  reservationStatusLabel,
  tAdmin,
} from "@/components/admin/admin-i18n";

export const dynamic = "force-dynamic";

export default async function AdminReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getServerLocale();
  const money = (cents: number) => adminMoneyFormatter(locale).format(cents / 100);
  const dateFmt = adminDateFormatter(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const dateTimeFmt = adminDateFormatter(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: ADMIN_RESERVATION_INCLUDE,
  });

  if (!reservation) notFound();

  const customerDisplay =
    `${reservation.customerFirstName ?? reservation.user.firstName ?? ""} ${
      reservation.customerLastName ?? reservation.user.lastName ?? ""
    }`.trim() ||
    reservation.customerEmail ||
    reservation.user.email;
  const now = new Date();
  const balanceOverdue =
    reservation.status === "CONFIRMED" &&
    reservation.balanceDueDate !== null &&
    reservation.paidAmountCents < reservation.totalAmountTtcCents &&
    now > reservation.balanceDueDate;

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href="/admin/reservations"
            className="admin-link text-sm"
          >
            {tAdmin(locale, "backToReservations")}
          </Link>
          <h1 className="mt-2 text-3xl">{reservation.bookingRef}</h1>
          <p className="admin-muted mt-1 text-sm">{customerDisplay}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{reservationStatusLabel(locale, reservation.status)}</Badge>
          <Badge tone="payment">{paymentStatusLabel(locale, reservation.paymentStatus)}</Badge>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-5">
          <Panel title={tAdmin(locale, "stay")}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info label={tAdmin(locale, "arrival")} value={dateFmt.format(reservation.startDate)} />
              <Info label={tAdmin(locale, "departure")} value={dateFmt.format(reservation.endDate)} />
              <Info label={tAdmin(locale, "adults")} value={String(reservation.adults)} />
              <Info label={tAdmin(locale, "children")} value={String(reservation.children)} />
            </div>
          </Panel>

          <Panel title={tAdmin(locale, "client")}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label={tAdmin(locale, "name")} value={customerDisplay} />
              <Info
                label={tAdmin(locale, "email")}
                value={reservation.customerEmail ?? reservation.user.email}
                href={`mailto:${reservation.customerEmail ?? reservation.user.email}`}
              />
              <Info
                label={tAdmin(locale, "phone")}
                value={reservation.customerPhone ?? reservation.user.phone ?? "-"}
                href={
                  reservation.customerPhone ?? reservation.user.phone
                    ? `tel:${reservation.customerPhone ?? reservation.user.phone}`
                    : undefined
                }
              />
              <Info
                label={tAdmin(locale, "mobile")}
                value={reservation.customerMobile ?? reservation.user.mobile ?? "-"}
                href={
                  reservation.customerMobile ?? reservation.user.mobile
                    ? `tel:${reservation.customerMobile ?? reservation.user.mobile}`
                    : undefined
                }
              />
              <Info
                label={tAdmin(locale, "address")}
                value={[
                  reservation.billingAddressNumber,
                  reservation.billingAddressStreet,
                  reservation.billingAddressCity,
                  reservation.billingAddressState,
                ]
                  .filter(Boolean)
                  .join(" ") || "-"}
              />
              <Info
                label={tAdmin(locale, "account")}
                value={reservation.user.email}
                href={`/admin/customers?q=${encodeURIComponent(reservation.user.email)}`}
              />
            </div>
          </Panel>

          <Panel title={tAdmin(locale, "finances")}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info label={tAdmin(locale, "baseHt")} value={money(reservation.baseAmountHtCents)} />
              <Info label={tAdmin(locale, "optionsHt")} value={money(reservation.optionsAmountHtCents)} />
              <Info label={tAdmin(locale, "vat")} value={money(reservation.vatAmountCents)} />
              {SHOW_TOURIST_TAX_BREAKDOWN && (
                <Info
                  label={tAdmin(locale, "touristTax")}
                  value={money(reservation.touristTaxAmountCents)}
                />
              )}
              <Info label={tAdmin(locale, "totalInclTax")} value={money(reservation.totalAmountTtcCents)} />
              <Info label={tAdmin(locale, "deposit")} value={money(reservation.depositAmountCents)} />
              <Info label={tAdmin(locale, "balance")} value={money(reservation.balanceAmountCents)} />
              <Info
                label={tAdmin(locale, "balanceDueDate")}
                value={
                  reservation.balanceDueDate
                    ? dateFmt.format(reservation.balanceDueDate)
                    : "-"
                }
              />
              <Info label={tAdmin(locale, "paid")} value={money(reservation.paidAmountCents)} />
              <Info
                label={tAdmin(locale, "status")}
                value={
                  reservation.paidAmountCents >= reservation.totalAmountTtcCents
                    ? tAdmin(locale, "paidFull")
                    : balanceOverdue
                      ? tAdmin(locale, "balanceOverdue")
                      : reservation.paidAmountCents > 0
                        ? tAdmin(locale, "paidDeposit")
                        : tAdmin(locale, "unpaid")
                }
              />
            </div>
          </Panel>

          <Panel title={tAdmin(locale, "options")}>
            {reservation.items.length ? (
              <div className="divide-y divide-[var(--admin-line)]">
                {reservation.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-1 py-2 text-sm md:grid-cols-[1fr_auto_auto]"
                  >
                    <span>{item.option.name}</span>
                    <span>x {item.quantity}</span>
                    <span>{money(item.totalPriceHtCents)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-muted text-sm">{tAdmin(locale, "noOptions")}</p>
            )}
          </Panel>

          <Panel title={tAdmin(locale, "payments")}>
            {reservation.payments.length ? (
              <div className="divide-y divide-[var(--admin-line)]">
                {reservation.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="grid gap-1 py-2 text-sm lg:grid-cols-[1fr_auto_auto_auto]"
                  >
                    <span>
                      {payment.provider} - {paymentPurposeLabel(locale, payment.purpose)}
                    </span>
                    <span>{paymentStatusLabel(locale, payment.status)}</span>
                    <span>{money(payment.amountCents)}</span>
                    <span className="admin-muted">
                      {payment.paidAt ? dateTimeFmt.format(payment.paidAt) : "-"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-muted text-sm">{tAdmin(locale, "noPayments")}</p>
            )}
          </Panel>

          <Panel title={tAdmin(locale, "history")}>
            <div className="divide-y divide-[var(--admin-line)]">
              {reservation.events.map((event) => (
                <div key={event.id} className="py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{event.type}</span>
                    <span className="admin-muted">
                      {dateTimeFmt.format(event.createdAt)}
                    </span>
                  </div>
                  {event.metadata ? (
                    <pre className="mt-2 overflow-x-auto rounded-md bg-[rgba(244,234,219,0.12)] p-2 text-xs text-[var(--admin-ink)]">
                      {JSON.stringify(event.metadata, null, 2)}
                    </pre>
                  ) : null}
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="space-y-5">
          <Panel title={tAdmin(locale, "adminActions")}>
            <AdminReservationActions
              reservationId={reservation.id}
              showGtcrBalanceCancel={balanceOverdue}
            />
          </Panel>
          <Panel title={tAdmin(locale, "consent")}>
            <div className="grid gap-3">
              <Info
                label={tAdmin(locale, "consentTerms")}
                value={
                  reservation.termsAcceptedAt
                    ? dateTimeFmt.format(reservation.termsAcceptedAt)
                    : "-"
                }
              />
              <Info label={tAdmin(locale, "versionTerms")} value={reservation.termsVersion ?? "-"} />
              <Info label={tAdmin(locale, "language")} value={reservation.termsLocale ?? "-"} />
              <Info label={tAdmin(locale, "ip")} value={reservation.consentIpAddress ?? "-"} />
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-surface p-5">
      <h2 className="mb-3 border-b border-[var(--admin-line)] pb-2 text-lg">{title}</h2>
      {children}
    </section>
  );
}

function Info({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const content = href ? (
    <Link href={href} className="admin-link break-words">
      {value}
    </Link>
  ) : (
    <span className="break-words">{value}</span>
  );

  return (
    <div>
      <p className="admin-eyebrow">{label}</p>
      <p className="mt-1 text-sm">{content}</p>
    </div>
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
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        tone === "payment"
          ? "admin-pill-blue"
          : "admin-pill"
      }`}
    >
      {children}
    </span>
  );
}
