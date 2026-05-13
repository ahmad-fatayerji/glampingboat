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
    <main className="min-h-screen bg-[#f6f1e9] px-4 pb-10 pt-32 text-[#102b3f] md:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[15rem_1fr]">
        <aside className="h-fit border border-[#d9cbb8] bg-white/88 p-3 shadow-[0_12px_35px_rgba(16,43,63,0.12)] backdrop-blur">
          <div className="border-b border-[#d9cbb8] px-3 pb-3">
            <p className="text-xs uppercase tracking-[0.22em] text-[#6c7c87]">
              Administration
            </p>
            <p className="mt-2 break-all text-sm font-medium">
              {session.user.email}
            </p>
            <p className="mt-1 text-xs text-[#6c7c87]">
              {isSuperAdminRole(session.user.role) ? "Super admin" : "Admin"}
            </p>
          </div>
          <nav className="mt-3 grid gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm transition hover:bg-[#e9dfd1]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="mt-4 block rounded-md border border-[#d9cbb8] px-3 py-2 text-sm text-[#516575] transition hover:bg-[#e9dfd1]"
          >
            Retour au site
          </Link>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
