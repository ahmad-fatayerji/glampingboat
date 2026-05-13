import Link from "next/link";
import { notFound } from "next/navigation";
import AdminReservationActions from "@/components/admin/AdminReservationActions";
import { ADMIN_RESERVATION_INCLUDE } from "@/lib/admin-data";
import { prisma } from "@/lib/prisma";

const money = (cents: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href="/admin/reservations"
            className="text-sm text-[#0d5680] hover:underline"
          >
            Retour aux reservations
          </Link>
          <h1 className="mt-2 text-3xl">{reservation.bookingRef}</h1>
          <p className="mt-1 text-sm text-[#637687]">{customerDisplay}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{reservation.status}</Badge>
          <Badge tone="payment">{reservation.paymentStatus}</Badge>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <Panel title="Sejour">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Arrivee" value={dateFmt.format(reservation.startDate)} />
              <Info label="Depart" value={dateFmt.format(reservation.endDate)} />
              <Info label="Adultes" value={String(reservation.adults)} />
              <Info label="Enfants" value={String(reservation.children)} />
            </div>
          </Panel>

          <Panel title="Client">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Nom" value={customerDisplay} />
              <Info
                label="Email"
                value={reservation.customerEmail ?? reservation.user.email}
                href={`mailto:${reservation.customerEmail ?? reservation.user.email}`}
              />
              <Info
                label="Telephone"
                value={reservation.customerPhone ?? reservation.user.phone ?? "-"}
                href={
                  reservation.customerPhone ?? reservation.user.phone
                    ? `tel:${reservation.customerPhone ?? reservation.user.phone}`
                    : undefined
                }
              />
              <Info
                label="Mobile"
                value={reservation.customerMobile ?? reservation.user.mobile ?? "-"}
                href={
                  reservation.customerMobile ?? reservation.user.mobile
                    ? `tel:${reservation.customerMobile ?? reservation.user.mobile}`
                    : undefined
                }
              />
              <Info
                label="Adresse"
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
                label="Compte"
                value={reservation.user.email}
                href={`/admin/customers?q=${encodeURIComponent(reservation.user.email)}`}
              />
            </div>
          </Panel>

          <Panel title="Finances">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Base HT" value={money(reservation.baseAmountHtCents)} />
              <Info label="Options HT" value={money(reservation.optionsAmountHtCents)} />
              <Info label="TVA" value={money(reservation.vatAmountCents)} />
              <Info label="Taxe sejour" value={money(reservation.touristTaxAmountCents)} />
              <Info label="Total TTC" value={money(reservation.totalAmountTtcCents)} />
              <Info label="Acompte" value={money(reservation.depositAmountCents)} />
              <Info label="Solde" value={money(reservation.balanceAmountCents)} />
              <Info label="Paye" value={money(reservation.paidAmountCents)} />
            </div>
          </Panel>

          <Panel title="Options">
            {reservation.items.length ? (
              <div className="divide-y divide-[#e3d7c7]">
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
              <p className="text-sm text-[#637687]">Aucune option.</p>
            )}
          </Panel>

          <Panel title="Paiements">
            {reservation.payments.length ? (
              <div className="divide-y divide-[#e3d7c7]">
                {reservation.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="grid gap-1 py-2 text-sm lg:grid-cols-[1fr_auto_auto_auto]"
                  >
                    <span>
                      {payment.provider} - {payment.purpose}
                    </span>
                    <span>{payment.status}</span>
                    <span>{money(payment.amountCents)}</span>
                    <span className="text-[#637687]">
                      {payment.paidAt ? dateTimeFmt.format(payment.paidAt) : "-"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#637687]">Aucun paiement.</p>
            )}
          </Panel>

          <Panel title="Historique">
            <div className="divide-y divide-[#e3d7c7]">
              {reservation.events.map((event) => (
                <div key={event.id} className="py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{event.type}</span>
                    <span className="text-[#637687]">
                      {dateTimeFmt.format(event.createdAt)}
                    </span>
                  </div>
                  {event.metadata ? (
                    <pre className="mt-2 overflow-x-auto rounded-md bg-[#f4eee5] p-2 text-xs text-[#344b5b]">
                      {JSON.stringify(event.metadata, null, 2)}
                    </pre>
                  ) : null}
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="space-y-5">
          <Panel title="Actions admin">
            <AdminReservationActions reservationId={reservation.id} />
          </Panel>
          <Panel title="Consentement">
            <div className="grid gap-3">
              <Info
                label="Conditions"
                value={
                  reservation.termsAcceptedAt
                    ? dateTimeFmt.format(reservation.termsAcceptedAt)
                    : "-"
                }
              />
              <Info label="Version CGV" value={reservation.termsVersion ?? "-"} />
              <Info label="Langue" value={reservation.termsLocale ?? "-"} />
              <Info label="IP" value={reservation.consentIpAddress ?? "-"} />
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
    <section className="border border-[#d9cbb8] bg-white/88 p-4 shadow-[0_10px_30px_rgba(16,43,63,0.08)]">
      <h2 className="mb-3 border-b border-[#d9cbb8] pb-2 text-lg">{title}</h2>
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
    <Link href={href} className="break-words text-[#0d5680] hover:underline">
      {value}
    </Link>
  ) : (
    <span className="break-words">{value}</span>
  );

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-[#637687]">{label}</p>
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
          ? "bg-[#dfeaf0] text-[#24475c]"
          : "bg-[#e9dfd1] text-[#4c4033]"
      }`}
    >
      {children}
    </span>
  );
}
