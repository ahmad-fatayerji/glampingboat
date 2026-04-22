import { auth } from "@auth";
import Link from "next/link";
import CredentialsTabs from "../../components/auth/CredentialsTabs";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import LogoutButton from "@/components/auth/LogoutButton";
import AccountTabs from "@/components/account/AccountTabs";
import { prisma } from "@/lib/prisma";
import { RESERVATION_WITH_ITEMS_INCLUDE, serializeReservation } from "@/lib/reservations";
import type { AccountTab } from "@/lib/types";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-40 pb-12">
        <AuthForms />
      </div>
    );
  }

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "desc" },
    include: RESERVATION_WITH_ITEMS_INCLUDE,
  });
  const serialized = reservations.map(serializeReservation);

  const resolvedSearchParams = await searchParams;
  const tabRaw = resolvedSearchParams.tab;
  const initialTab: AccountTab =
    (Array.isArray(tabRaw) ? tabRaw[0] : tabRaw) === "profile"
      ? "profile"
      : "bookings";

  return (
    <div className="min-h-screen px-4 pt-40 pb-24 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-6">
        <AccountHeader email={session.user.email || ""} />
        <AccountTabs reservations={serialized} initialTab={initialTab} />
      </div>
    </div>
  );
}

function AccountHeader({ email }: { email: string }) {
  return (
    <div className="w-full border border-white/15 bg-[#3f5666]/82 px-6 py-5 md:px-8 md:py-6 shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm space-y-4 text-[var(--color-beige)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="border-b border-[#173c59] pb-2 text-[1.3rem] lowercase tracking-wide text-[var(--color-beige)] md:border-b-0 md:pb-0">
          your account
        </h1>
        <div className="flex items-center justify-between gap-4 rounded-md border border-[#0d3350] bg-[var(--color-beige)] px-4 py-2 text-sm text-[var(--color-blue)] w-full md:w-auto">
          <span className="truncate font-medium">{email}</span>
          <LogoutButton />
        </div>
      </div>
      <p className="text-xs lowercase tracking-wide text-[var(--color-beige)]/70">
        use the tabs below to manage bookings or update your profile.
      </p>
    </div>
  );
}

function AuthForms() {
  return (
    <div className="w-full max-w-md border border-white/15 bg-[#3f5666]/92 p-8 text-[var(--color-beige)] shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm space-y-8">
      <CredentialsTabs />
      <div className="relative flex items-center gap-4 text-[10px] uppercase tracking-wider text-[var(--color-beige)]/60">
        <span className="flex-1 h-px bg-[#173c59]" />
        <span>or</span>
        <span className="flex-1 h-px bg-[#173c59]" />
      </div>
      <GoogleSignInButton dark />
      <div className="text-right -mt-4">
        <Link
          href="/forgot-password"
          className="text-xs lowercase text-[var(--color-beige)]/70 hover:text-[var(--color-beige)] underline underline-offset-2"
        >
          forgot password?
        </Link>
      </div>
    </div>
  );
}
