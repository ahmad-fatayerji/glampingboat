import { auth } from "@auth";
import AccountAuthPanel from "@/components/account/AccountAuthPanel";
import AccountHeader from "@/components/account/AccountHeader";
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
        <AccountAuthPanel />
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
