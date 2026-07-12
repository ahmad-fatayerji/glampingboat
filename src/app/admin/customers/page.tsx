import Link from "next/link";
import AdminRoleSelect from "@/components/admin/AdminRoleSelect";
import { requireAdmin } from "@/lib/admin";
import { isSuperAdminRole } from "@/lib/admin-roles";
import { prisma } from "@/lib/prisma";
import { getEffectiveRoleForEmail } from "@/lib/super-admin";

export const dynamic = "force-dynamic";

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

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await requireAdmin();
  const params = await searchParams;
  const q = Array.isArray(params.q) ? params.q[0] : params.q;
  const search = q?.trim();
  const canManageRoles = isSuperAdminRole(session.user.role);

  const customers = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { mobile: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      phone: true,
      mobile: true,
      addressStreet: true,
      addressCity: true,
      role: true,
      createdAt: true,
      _count: { select: { reservations: true } },
      reservations: {
        orderBy: { startDate: "desc" },
        take: 3,
        select: {
          id: true,
          bookingRef: true,
          status: true,
          startDate: true,
          endDate: true,
          paidAmountCents: true,
          totalAmountTtcCents: true,
        },
      },
    },
  });

  return (
    <div className="space-y-5">
      <header>
        <p className="admin-eyebrow">
          Comptes
        </p>
        <h1 className="mt-2 text-3xl">Clients</h1>
      </header>

      <form className="admin-surface grid gap-3 p-4 md:grid-cols-[1fr_auto]">
        <input
          name="q"
          defaultValue={search ?? ""}
          placeholder="Nom, email, telephone"
          className="admin-input h-10 rounded-md px-3 text-sm"
        />
        <button className="admin-button h-10 rounded-md px-4 text-sm font-medium">
          Rechercher
        </button>
      </form>

      <section className="grid gap-3">
        {customers.map((customer) => {
          const name =
            `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
            customer.name ||
            "Client";
          const missingProfileFields = [
            !customer.firstName ? "Prenom" : null,
            !customer.lastName ? "Nom" : null,
            !customer.phone ? "Telephone" : null,
            !customer.addressStreet ? "Adresse" : null,
            !customer.addressCity ? "Ville" : null,
          ].filter((field): field is string => Boolean(field));
          const paidCents = customer.reservations.reduce(
            (sum, reservation) => sum + reservation.paidAmountCents,
            0
          );
          const effectiveRole = getEffectiveRoleForEmail(
            customer.email,
            customer.role
          );

          return (
            <article
              key={customer.id}
              className="admin-surface grid gap-4 p-4 xl:grid-cols-[1.1fr_1fr_auto]"
            >
              <div className="space-y-2">
                <div>
                  <h2 className="text-lg">{name}</h2>
                  <p className="admin-muted break-all text-sm">{customer.email}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge>{effectiveRole}</Badge>
                  <ProfileStatusBadge missingFields={missingProfileFields} />
                  <Badge>{customer._count.reservations} reservation(s)</Badge>
                </div>
                <div className="grid gap-1 text-sm text-[var(--admin-ink)] sm:grid-cols-2">
                  <p>
                    Telephone:{" "}
                    {customer.phone ? (
                      <Link href={`tel:${customer.phone}`} className="admin-link">
                        {customer.phone}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </p>
                  <p>Compte cree le {dateFmt.format(customer.createdAt)}</p>
                  <p>Total paye: {money(paidCents)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="admin-eyebrow">
                  Dernieres reservations
                </p>
                {customer.reservations.length ? (
                  customer.reservations.map((reservation) => (
                    <Link
                      key={reservation.id}
                      href={`/admin/reservations/${reservation.id}`}
                      className="admin-row block rounded-md px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{reservation.bookingRef}</span>
                      <span className="admin-muted ml-2">
                        {dateFmt.format(reservation.startDate)} -{" "}
                        {dateFmt.format(reservation.endDate)}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="admin-muted text-sm">Aucune reservation.</p>
                )}
              </div>

              <div className="xl:justify-self-end">
                {canManageRoles ? (
                  <AdminRoleSelect
                    userId={customer.id}
                    value={effectiveRole}
                    disabled={
                      customer.id === session.user.id ||
                      effectiveRole === "SUPER_ADMIN"
                    }
                  />
                ) : (
                  <p className="admin-muted text-sm">
                    Roles geres par le super admin.
                  </p>
                )}
              </div>
            </article>
          );
        })}
        {!customers.length && (
          <p className="admin-surface admin-muted p-8 text-center text-sm">
            Aucun client trouve.
          </p>
        )}
      </section>
    </div>
  );
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "ok" | "warn";
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 font-medium ${
        tone === "ok"
          ? "admin-pill-ok"
          : tone === "warn"
            ? "admin-pill-warn"
            : "admin-pill"
      }`}
    >
      {children}
    </span>
  );
}

function ProfileStatusBadge({ missingFields }: { missingFields: string[] }) {
  if (!missingFields.length) {
    return <Badge tone="ok">Profil complet</Badge>;
  }

  return (
    <span className="group relative inline-flex w-fit" tabIndex={0}>
      <Badge tone="warn">Profil incomplet</Badge>
      <span className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden min-w-52 rounded-md border border-[#173c59] bg-[#0d3350] p-3 text-xs font-normal text-[var(--color-beige)] shadow-[0_14px_35px_rgba(0,0,0,0.32)] group-hover:block group-focus:block">
        <span className="block font-medium">Champs manquants</span>
        <span className="admin-muted mt-1 block">
          {missingFields.join(", ")}
        </span>
      </span>
    </span>
  );
}
