import Link from "next/link";
import AdminRoleSelect from "@/components/admin/AdminRoleSelect";
import { requireAdmin } from "@/lib/admin";
import { isSuperAdminRole } from "@/lib/admin-roles";
import { prisma } from "@/lib/prisma";
import { getEffectiveRoleForEmail } from "@/lib/super-admin";
import { getServerLocale } from "@/components/Language/server-locale";
import {
  adminDateFormatter,
  adminMoneyFormatter,
  roleLabel,
  tAdmin,
} from "@/components/admin/admin-i18n";
import { Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { IconSearch } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
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
    <div className="space-y-6">
      <PageHeader
        eyebrow={tAdmin(locale, "account")}
        title={tAdmin(locale, "clients")}
        actions={
          <span className="admin-muted self-center text-sm tabular-nums">
            {tAdmin(locale, "resultsCount", { count: customers.length })}
          </span>
        }
      />

      <form className="admin-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <label className="grid flex-1 gap-1.5">
          <span className="admin-eyebrow">{tAdmin(locale, "search")}</span>
          <input
            name="q"
            defaultValue={search ?? ""}
            placeholder={`${tAdmin(locale, "name")}, ${tAdmin(locale, "email")}, ${tAdmin(locale, "phone")}`}
            className="admin-input h-10 px-3 text-sm"
          />
        </label>
        <div className="flex gap-2">
          <button className="admin-button h-10 flex-1 px-4 text-sm font-medium sm:flex-none">
            <IconSearch className="text-[0.95em]" />
            {tAdmin(locale, "search")}
          </button>
          {search ? (
            <Link
              href="/admin/customers"
              className="admin-button-secondary h-10 px-4 text-sm font-medium"
            >
              &times;
            </Link>
          ) : null}
        </div>
      </form>

      <section className="grid gap-4">
        {customers.map((customer) => {
          const name =
            `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
            customer.name ||
            tAdmin(locale, "client");
          const missingProfileFields = [
            !customer.firstName ? tAdmin(locale, "firstName") : null,
            !customer.lastName ? tAdmin(locale, "name") : null,
            !customer.phone ? tAdmin(locale, "phone") : null,
            !customer.addressStreet ? tAdmin(locale, "address") : null,
            !customer.addressCity ? tAdmin(locale, "city") : null,
          ].filter((field): field is string => Boolean(field));
          const paidCents = customer.reservations.reduce(
            (sum, reservation) => sum + reservation.paidAmountCents,
            0
          );
          const effectiveRole = getEffectiveRoleForEmail(customer.email, customer.role);
          const initial = name.trim().charAt(0).toUpperCase() || "?";

          return (
            <article key={customer.id} className="admin-surface overflow-hidden">
              {/* Identity + role control */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--admin-line)] p-5">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--admin-line-strong)] bg-[rgba(228,219,206,0.12)] text-sm font-semibold"
                    aria-hidden
                  >
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-medium leading-tight">{name}</h2>
                    <Link
                      href={`mailto:${customer.email}`}
                      className="admin-link break-all text-sm"
                    >
                      {customer.email}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge>{roleLabel(locale, effectiveRole)}</Badge>
                      <ProfileStatusBadge missingFields={missingProfileFields} locale={locale} />
                      <Badge tone="blue">
                        {tAdmin(locale, "reservationCount", {
                          count: customer._count.reservations,
                        })}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  {canManageRoles ? (
                    <AdminRoleSelect
                      userId={customer.id}
                      value={effectiveRole}
                      disabled={
                        customer.id === session.user.id || effectiveRole === "SUPER_ADMIN"
                      }
                    />
                  ) : (
                    <p className="admin-muted max-w-48 text-xs leading-relaxed">
                      {tAdmin(locale, "rolesManagedBySuperAdmin")}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 p-5 lg:grid-cols-2">
                <dl className="grid gap-3 sm:grid-cols-2">
                  <Detail label={tAdmin(locale, "phone")}>
                    {customer.phone ? (
                      <Link href={`tel:${customer.phone}`} className="admin-link">
                        {customer.phone}
                      </Link>
                    ) : (
                      <span className="admin-muted">&mdash;</span>
                    )}
                  </Detail>
                  <Detail label={tAdmin(locale, "createdOnLabel")}>
                    <span className="tabular-nums">{dateFmt.format(customer.createdAt)}</span>
                  </Detail>
                  <Detail label={tAdmin(locale, "paidTotalLabel")}>
                    <span className="font-medium tabular-nums">{money(paidCents)}</span>
                  </Detail>
                </dl>

                <div>
                  <p className="admin-eyebrow mb-2">{tAdmin(locale, "latestReservations")}</p>
                  {customer.reservations.length ? (
                    <ul className="grid gap-2">
                      {customer.reservations.map((reservation) => (
                        <li key={reservation.id}>
                          <Link
                            href={`/admin/reservations/${reservation.id}`}
                            className="admin-row flex items-center justify-between gap-3 px-3 py-2 text-sm"
                          >
                            <span className="truncate font-mono text-xs font-medium">
                              {reservation.bookingRef}
                            </span>
                            <span className="admin-muted shrink-0 text-xs tabular-nums">
                              {shortDateFmt.format(reservation.startDate)} &ndash;{" "}
                              {shortDateFmt.format(reservation.endDate)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="admin-muted text-sm">{tAdmin(locale, "noReservation")}</p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        {!customers.length && (
          <div className="admin-surface p-5">
            <EmptyState label={tAdmin(locale, "noCustomersFound")} />
          </div>
        )}
      </section>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="admin-eyebrow">{label}</dt>
      <dd className="mt-1 break-words text-sm">{children}</dd>
    </div>
  );
}

function ProfileStatusBadge({
  missingFields,
  locale,
}: {
  missingFields: string[];
  locale: Parameters<typeof tAdmin>[0];
}) {
  if (!missingFields.length) {
    return <Badge tone="ok">{tAdmin(locale, "profileComplete")}</Badge>;
  }

  return (
    <span
      className="group relative inline-flex w-fit"
      tabIndex={0}
      title={`${tAdmin(locale, "missingFields")} ${missingFields.join(", ")}`}
    >
      <Badge tone="warn">{tAdmin(locale, "profileIncomplete")}</Badge>
      <span className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden min-w-52 rounded-[var(--admin-radius-sm)] border border-[#173c59] bg-[#0d3350] p-3 text-xs font-normal text-[var(--color-beige)] shadow-[0_14px_35px_rgba(0,0,0,0.32)] group-hover:block group-focus:block">
        <span className="block font-medium">{tAdmin(locale, "missingFields")}</span>
        <span className="admin-muted mt-1 block">{missingFields.join(", ")}</span>
      </span>
    </span>
  );
}
