import { auth } from "@/../auth";
import CredentialsTabs from "../../components/auth/CredentialsTabs";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import LogoutButton from "@/components/auth/LogoutButton";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ReservationList from "../../components/account/ReservationList";

export default async function AccountPage() {
  const session = await auth();
  if (!session) {
    return (
      <div className="min-h-screen bg-[var(--color-white)] flex items-center justify-center px-4 pt-40 pb-12">
        <AuthForms />
      </div>
    );
  }

  // Fetch reservations for this user (newest first)
  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user?.id || "" },
    orderBy: { startDate: "desc" },
    include: { items: { include: { option: true } } },
  });
  // Serialize dates for client component
  const serialized = reservations.map((r) => ({
    ...r,
    startDate: r.startDate.toISOString(),
    endDate: r.endDate.toISOString(),
    createdAt: r.createdAt.toISOString(),
    items: r.items.map((it) => ({
      ...it,
      option: { ...it.option },
    })),
  }));

  return (
    <div className="min-h-screen bg-[var(--color-white)] px-4 pt-40 pb-24 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-8">
        <AccountHeader email={session.user?.email || ""} />
        <ReservationList reservations={serialized} />
      </div>
    </div>
  );
}

function AccountHeader({ email }: { email: string }) {
  return (
    <div className="w-full bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-[var(--color-blue)]/10 space-y-4 text-[var(--color-blue)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-wide">Your Account</h1>
        <div className="text-sm flex items-center justify-between bg-[var(--color-beige)]/60 px-4 py-2 rounded-md w-full md:w-auto">
          <span className="truncate font-medium">{email}</span>
          <div className="ml-4">
            <LogoutButton />
          </div>
        </div>
      </div>
      <p className="text-xs text-[var(--color-blue)]/60">
        Manage your reservations below. Upcoming stays appear first.
      </p>
    </div>
  );
}

function AuthForms() {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg border border-[var(--color-blue)]/10 space-y-8 text-[var(--color-blue)]">
      <CredentialsTabs />
      <div className="relative flex items-center gap-4 text-[10px] uppercase tracking-wider text-[var(--color-blue)]/50">
        <span className="flex-1 h-px bg-[var(--color-blue)]/15" />
        <span>or</span>
        <span className="flex-1 h-px bg-[var(--color-blue)]/15" />
      </div>
      <GoogleSignInButton />
      <div className="text-right -mt-4">
        <Link
          href="/forgot-password"
          className="text-xs text-[var(--color-blue)]/60 hover:text-[var(--color-blue)] underline underline-offset-2"
        >
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
