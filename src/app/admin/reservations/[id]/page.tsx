import { notFound } from "next/navigation";
import AdminReservationActions from "@/components/admin/AdminReservationActions";
import AdminReservationFinance from "@/components/admin/AdminReservationFinance";
import { SHOW_TOURIST_TAX_BREAKDOWN } from "@/lib/booking-features";
import { ADMIN_RESERVATION_INCLUDE } from "@/lib/admin-data";
import { prisma } from "@/lib/prisma";
import { getServerLocale } from "@/components/Language/server-locale";
import {
  adminDateFormatter,
  adminMoneyFormatter,
  bookingPaymentStatusLabel,
  paymentPurposeLabel,
  paymentStatusLabel,
  reservationStatusLabel,
  tAdmin,
} from "@/components/admin/admin-i18n";
import { Badge, EmptyState, Info, InfoRow, PageHeader, Panel } from "@/components/admin/ui";

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
  const fullyPaid = reservation.paidAmountCents >= reservation.totalAmountTtcCents;
  const nights = Math.max(
    Math.round(
      (reservation.endDate.getTime() - reservation.startDate.getTime()) / 86_400_000
    ),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={tAdmin(locale, "reservations")}
        title={reservation.bookingRef}
        description={customerDisplay}
        backLink={{
          href: "/admin/reservations",
          label: tAdmin(locale, "backToReservations"),
        }}
        actions={
          <div className="flex flex-wrap items-center gap-2 self-center">
            <Badge>{reservationStatusLabel(locale, reservation.status)}</Badge>
            <Badge tone={fullyPaid ? "ok" : balanceOverdue ? "warn" : "blue"}>
              {paymentStatusLabel(locale, reservation.paymentStatus)}
            </Badge>
          </div>
        }
      />

      {balanceOverdue ? (
        <p className="admin-pill-warn rounded-[var(--admin-radius-sm)] border px-4 py-3 text-sm">
          {tAdmin(locale, "balanceOverdue")}
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-5">
          <Panel title={tAdmin(locale, "stay")}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Info
                label={tAdmin(locale, "arrival")}
                value={dateFmt.format(reservation.startDate)}
              />
              <Info
                label={tAdmin(locale, "departure")}
                value={dateFmt.format(reservation.endDate)}
              />
              <Info label={tAdmin(locale, "adults")} value={String(reservation.adults)} />
              <Info label={tAdmin(locale, "children")} value={String(reservation.children)} />
            </div>
            {nights > 0 ? (
              <p className="admin-muted mt-4 border-t border-[var(--admin-line)] pt-3 text-xs tabular-nums">
                {tAdmin(locale, "nightCount", { count: nights })}
              </p>
            ) : null}
          </Panel>

          <Panel title={tAdmin(locale, "client")}>
            <div className="grid gap-4 sm:grid-cols-2">
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
                value={
                  [
                    reservation.billingAddressNumber,
                    reservation.billingAddressStreet,
                    reservation.billingAddressCity,
                    reservation.billingAddressState,
                  ]
                    .filter(Boolean)
                    .join(" ") || "-"
                }
              />
              <Info
                label={tAdmin(locale, "account")}
                value={reservation.user.email}
                href={`/admin/customers?q=${encodeURIComponent(reservation.user.email)}`}
              />
            </div>
          </Panel>

          <Panel title={tAdmin(locale, "finances")}>
            <AdminReservationFinance
              locale={locale}
              showTouristTaxBreakdown={SHOW_TOURIST_TAX_BREAKDOWN}
              reservation={{
                id: reservation.id,
                paidAmountCents: reservation.paidAmountCents,
                totalAmountTtcCents: reservation.totalAmountTtcCents,
                baseAmountHtCents: reservation.baseAmountHtCents,
                optionsAmountHtCents: reservation.optionsAmountHtCents,
                vatAmountCents: reservation.vatAmountCents,
                touristTaxAmountCents: reservation.touristTaxAmountCents,
                depositAmountCents: reservation.depositAmountCents,
                balanceDueDate: reservation.balanceDueDate?.toISOString() ?? null,
                balanceOverdue,
              }}
            />
          </Panel>

          <Panel title={tAdmin(locale, "options")}>
            {reservation.items.length ? (
              <ul className="grid gap-2">
                {reservation.items.map((item) => (
                  <li
                    key={item.id}
                    className="admin-row flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm"
                  >
                    <span className="min-w-0 truncate">{item.option.name}</span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="admin-muted tabular-nums">&times;{item.quantity}</span>
                      <span className="font-medium tabular-nums">
                        {money(item.totalPriceHtCents)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState label={tAdmin(locale, "noOptions")} />
            )}
          </Panel>

          <Panel title={tAdmin(locale, "payments")}>
            {reservation.payments.length ? (
              <ul className="grid gap-2">
                {reservation.payments.map((payment) => (
                  <li
                    key={payment.id}
                    className="admin-row flex flex-col gap-2 px-3.5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {paymentPurposeLabel(locale, payment.purpose)}
                      </p>
                      <p className="admin-muted mt-0.5 text-xs">
                        {payment.provider}
                        {payment.paidAt ? ` · ${dateTimeFmt.format(payment.paidAt)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <Badge
                        tone={
                          payment.status === "PAID"
                            ? "ok"
                            : payment.status === "FAILED" || payment.status === "EXPIRED"
                              ? "warn"
                              : "blue"
                        }
                      >
                        {bookingPaymentStatusLabel(locale, payment.status)}
                      </Badge>
                      <span className="shrink-0 font-medium tabular-nums">
                        {money(payment.amountCents)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState label={tAdmin(locale, "noPayments")} />
            )}
          </Panel>

          <Panel title={tAdmin(locale, "history")}>
            {reservation.events.length ? (
              <ol className="relative grid gap-4 border-l border-[var(--admin-line)] pl-5">
                {reservation.events.map((event) => (
                  <li key={event.id} className="relative text-sm">
                    <span
                      className="absolute -left-[1.4rem] top-1.5 size-2 rounded-full bg-[var(--admin-muted)]"
                      aria-hidden
                    />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="font-mono text-xs font-medium">{event.type}</span>
                      <span className="admin-muted text-xs tabular-nums">
                        {dateTimeFmt.format(event.createdAt)}
                      </span>
                    </div>
                    {event.metadata ? (
                      <details className="mt-1.5">
                        <summary className="admin-muted cursor-pointer text-xs">
                          {tAdmin(locale, "details")}
                        </summary>
                        <pre className="admin-card mt-2 overflow-x-auto p-2.5 text-xs leading-relaxed">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </details>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState label={tAdmin(locale, "noHistory")} />
            )}
          </Panel>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <Panel title={tAdmin(locale, "adminActions")}>
            <AdminReservationActions
              reservationId={reservation.id}
              showGtcrBalanceCancel={balanceOverdue}
            />
          </Panel>
          <Panel title={tAdmin(locale, "consent")}>
            <div className="grid gap-2.5">
              <InfoRow
                label={tAdmin(locale, "consentTerms")}
                value={
                  reservation.termsAcceptedAt
                    ? dateTimeFmt.format(reservation.termsAcceptedAt)
                    : "-"
                }
              />
              <InfoRow
                label={tAdmin(locale, "versionTerms")}
                value={reservation.termsVersion ?? "-"}
              />
              <InfoRow
                label={tAdmin(locale, "language")}
                value={reservation.termsLocale ?? "-"}
              />
              <InfoRow label={tAdmin(locale, "ip")} value={reservation.consentIpAddress ?? "-"} />
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
