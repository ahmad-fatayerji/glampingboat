import Link from "next/link";
import {
  ADMIN_RESERVATION_INCLUDE,
  buildAdminReservationWhere,
} from "@/lib/admin-data";
import { prisma } from "@/lib/prisma";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const money = (cents: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
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
          <p className="text-sm uppercase tracking-[0.24em] text-[#637687]">
            Gestion
          </p>
          <h1 className="mt-2 text-3xl">Reservations</h1>
        </div>
        <p className="text-sm text-[#637687]">{reservations.length} resultat(s)</p>
      </header>

      <form className="grid gap-3 border border-[#d9cbb8] bg-white/88 p-4 shadow-[0_10px_30px_rgba(16,43,63,0.08)] md:grid-cols-[1fr_auto_auto_auto_auto]">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Reference, client, email, telephone"
          className="h-10 rounded-md border border-[#cdbda8] bg-[#fbf8f3] px-3 text-sm outline-none focus:border-[#527086]"
        />
        <Select name="timing" defaultValue={timing} options={timingOptions} />
        <Select name="status" defaultValue={status} options={statusOptions} />
        <Select
          name="paymentStatus"
          defaultValue={paymentStatus}
          options={paymentOptions}
        />
        <button className="h-10 rounded-md bg-[#102b3f] px-4 text-sm text-white transition hover:bg-[#183d58]">
          Rechercher
        </button>
      </form>

      <section className="overflow-hidden border border-[#d9cbb8] bg-white/88 shadow-[0_10px_30px_rgba(16,43,63,0.08)]">
        <div className="hidden grid-cols-[1.2fr_1.4fr_1fr_1fr_1fr_auto] gap-3 border-b border-[#d9cbb8] bg-[#efe7dc] px-4 py-3 text-xs uppercase tracking-[0.16em] text-[#637687] lg:grid">
          <span>Reference</span>
          <span>Client</span>
          <span>Dates</span>
          <span>Statut</span>
          <span>Total</span>
          <span />
        </div>
        <div className="divide-y divide-[#e3d7c7]">
          {reservations.map((reservation) => (
            <Link
              key={reservation.id}
              href={`/admin/reservations/${reservation.id}`}
              className="grid gap-2 px-4 py-4 text-sm transition hover:bg-[#fbf8f3] lg:grid-cols-[1.2fr_1.4fr_1fr_1fr_1fr_auto] lg:items-center"
            >
              <div>
                <p className="font-semibold">{reservation.bookingRef}</p>
                <p className="text-xs text-[#637687]">
                  creee le {dateFmt.format(reservation.createdAt)}
                </p>
              </div>
              <div>
                <p>
                  {customerName(reservation) || "Client"}
                </p>
                <p className="break-all text-xs text-[#637687]">
                  {reservation.customerEmail ?? reservation.user.email}
                </p>
              </div>
              <p>
                {dateFmt.format(reservation.startDate)} -{" "}
                {dateFmt.format(reservation.endDate)}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge>{reservation.status}</Badge>
                <Badge tone="payment">{reservation.paymentStatus}</Badge>
              </div>
              <p>{money(reservation.totalAmountTtcCents)}</p>
              <span className="text-[#0d5680]">Ouvrir</span>
            </Link>
          ))}
          {!reservations.length && (
            <p className="px-4 py-8 text-center text-sm text-[#637687]">
              Aucune reservation trouvee.
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
      className="h-10 rounded-md border border-[#cdbda8] bg-[#fbf8f3] px-3 text-sm outline-none focus:border-[#527086]"
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
          ? "bg-[#dfeaf0] text-[#24475c]"
          : "bg-[#e9dfd1] text-[#4c4033]"
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

const timingOptions = [
  { value: "all", label: "Toutes les dates" },
  { value: "upcoming", label: "A venir" },
  { value: "past", label: "Passees" },
];

const statusOptions = [
  { value: "all", label: "Tous les statuts" },
  { value: "PENDING_PAYMENT", label: "Paiement en attente" },
  { value: "CONFIRMED", label: "Confirmee" },
  { value: "CANCELLED", label: "Annulee" },
  { value: "EXPIRED", label: "Expiree" },
  { value: "REFUNDED", label: "Remboursee" },
];

const paymentOptions = [
  { value: "all", label: "Tous les paiements" },
  { value: "UNPAID", label: "Non paye" },
  { value: "CHECKOUT_OPEN", label: "Checkout ouvert" },
  { value: "PAID_DEPOSIT", label: "Acompte paye" },
  { value: "PAID_FULL", label: "Paye integralement" },
  { value: "PAYMENT_FAILED", label: "Paiement echoue" },
  { value: "REFUNDED", label: "Rembourse" },
];
