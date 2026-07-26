import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin";
import { isSuperAdminRole } from "@/lib/admin-roles";
import { getServerLocale } from "@/components/Language/server-locale";
import { roleLabel, tAdmin } from "@/components/admin/admin-i18n";
import AdminNav from "@/components/admin/AdminNav";
import {
  IconBookmark,
  IconCalendar,
  IconDashboard,
  IconExternal,
  IconFlag,
  IconUsers,
} from "@/components/admin/icons";

const navItems = [
  { href: "/admin", label: "dashboard", icon: <IconDashboard /> },
  { href: "/admin/reservations", label: "reservations", icon: <IconBookmark /> },
  { href: "/admin/customers", label: "clients", icon: <IconUsers /> },
  { href: "/admin/calendar", label: "calendar", icon: <IconCalendar /> },
] as const;

const superAdminNavItems = [
  { href: "/admin/feature-flags", label: "featureFlags", icon: <IconFlag /> },
] as const;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let session;

  try {
    session = await requireAdmin();
  } catch (error) {
    if (error && typeof error === "object" && "status" in error) {
      if (error.status === 401) redirect("/account");
      notFound();
    }

    throw error;
  }

  const locale = await getServerLocale();
  const email = session.user.email ?? "";
  const initial = email.trim().charAt(0).toUpperCase() || "?";

  const items = [
    ...navItems,
    ...(isSuperAdminRole(session.user.role) ? superAdminNavItems : []),
  ].map((item) => ({
    href: item.href,
    label: tAdmin(locale, item.label),
    icon: item.icon,
  }));

  return (
    <main className="admin-shell px-4 pb-12 pt-32 md:px-8">
      <div className="mx-auto grid w-full max-w-[92rem] gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="admin-sidebar h-fit p-3 lg:sticky lg:top-28">
          <div className="flex items-center gap-3 border-b border-[var(--admin-line)] px-2 pb-3">
            <span
              className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--admin-line-strong)] bg-[rgba(228,219,206,0.12)] text-sm font-semibold"
              aria-hidden
            >
              {initial}
            </span>
            <div className="min-w-0">
              <p className="admin-eyebrow">{tAdmin(locale, "administration")}</p>
              <p
                className="mt-1 truncate text-sm font-medium leading-tight"
                title={email}
              >
                {email}
              </p>
              <p className="admin-muted mt-0.5 text-xs">
                {roleLabel(locale, session.user.role)}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <AdminNav items={items} />
          </div>

          <Link
            href="/"
            className="admin-button-secondary mt-4 w-full px-3 py-2 text-sm"
          >
            <IconExternal className="text-[0.95em]" />
            {tAdmin(locale, "backToSite")}
          </Link>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
