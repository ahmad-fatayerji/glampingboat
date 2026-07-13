import { auth, isGoogleAuthEnabled } from "@auth";
import AccountAuthPanel from "@/components/account/AccountAuthPanel";
import AccountHeader from "@/components/account/AccountHeader";
import AccountTabs from "@/components/account/AccountTabs";
import { isAdminRole } from "@/lib/admin-roles";
import { prisma } from "@/lib/prisma";
import { RESERVATION_WITH_ITEMS_INCLUDE, serializeReservation } from "@/lib/reservations";
import type { AccountTab } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const resolvedSearchParams = await searchParams;
  const signedOutRaw = resolvedSearchParams.signedOut;
  const signedOutRecently =
    (Array.isArray(signedOutRaw) ? signedOutRaw[0] : signedOutRaw) === "1";

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-40 pb-12">
        <AccountAuthPanel
          googleAuthEnabled={isGoogleAuthEnabled()}
          signedOutRecently={signedOutRecently}
        />
      </div>
    );
  }

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "desc" },
    include: RESERVATION_WITH_ITEMS_INCLUDE,
  });
  const serialized = reservations.map(serializeReservation);

  const tabRaw = resolvedSearchParams.tab;
  const signedInRaw = resolvedSearchParams.signedIn;
  const initialTab: AccountTab =
    (Array.isArray(tabRaw) ? tabRaw[0] : tabRaw) === "profile"
      ? "profile"
      : "bookings";
  const signedInRecently =
    (Array.isArray(signedInRaw) ? signedInRaw[0] : signedInRaw) === "1";

  return (
    <div className="min-h-screen px-4 pt-40 pb-24 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-6">
        <AccountHeader
          email={session.user.email || ""}
          canAccessAdmin={isAdminRole(session.user.role)}
          signedInRecently={signedInRecently}
        />
        <AccountTabs reservations={serialized} initialTab={initialTab} />
      </div>
    </div>
  );
}
