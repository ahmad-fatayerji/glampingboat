"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReservationList from "./ReservationList";
import ProfileForm from "./ProfileForm";
import type { AccountTab, ReservationSerialized } from "@/lib/types";

interface Props {
  reservations: ReservationSerialized[];
  initialTab: AccountTab;
}

export default function AccountTabs({ reservations, initialTab }: Props) {
  const search = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<AccountTab>(initialTab);

  useEffect(() => {
    const nextTab: AccountTab =
      search.get("tab") === "profile" ? "profile" : "bookings";
    startTransition(() => {
      setTab(nextTab);
    });
  }, [search]);

  const switchTab = (nextTab: AccountTab) => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", nextTab);
    router.push(`${url.pathname}?${url.searchParams.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="w-full bg-white rounded-xl p-2 shadow border border-[var(--color-blue)]/10 flex items-center gap-2 text-sm">
        <TabButton
          active={tab === "bookings"}
          onClick={() => switchTab("bookings")}
        >
          Bookings
        </TabButton>
        <TabButton
          active={tab === "profile"}
          onClick={() => switchTab("profile")}
        >
          Profile
        </TabButton>
      </div>
      {tab === "bookings" && <ReservationList reservations={reservations} />}
      {tab === "profile" && <ProfileForm />}
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg font-medium transition ${
        active
          ? "bg-[var(--color-blue)] text-[var(--color-beige)] shadow-inner"
          : "text-[var(--color-blue)] hover:bg-[var(--color-beige)]/60"
      }`}
    >
      {children}
    </button>
  );
}
