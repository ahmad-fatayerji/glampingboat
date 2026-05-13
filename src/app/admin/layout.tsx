import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin";
import { isSuperAdminRole } from "@/lib/admin-roles";

const navItems = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/customers", label: "Clients" },
  { href: "/admin/calendar", label: "Calendrier" },
];

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

  return (
    <main className="admin-shell px-4 pb-10 pt-32 md:px-8">
      <div className="mx-auto grid w-full max-w-[92rem] gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="admin-sidebar h-fit p-3">
          <div className="border-b border-[var(--admin-line)] px-3 pb-3">
            <p className="admin-eyebrow">
              Administration
            </p>
            <p className="mt-2 overflow-hidden text-ellipsis text-sm font-medium leading-tight">
              {session.user.email}
            </p>
            <p className="admin-muted mt-1 text-xs">
              {isSuperAdminRole(session.user.role) ? "Super admin" : "Admin"}
            </p>
          </div>
          <nav className="mt-3 grid gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm transition hover:bg-[var(--admin-hover)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="admin-link mt-4 block rounded-md border border-[var(--admin-line)] px-3 py-2 text-sm transition hover:bg-[var(--admin-hover)]"
          >
            Retour au site
          </Link>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
