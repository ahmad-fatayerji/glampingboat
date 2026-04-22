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
      <div className="flex w-full items-center gap-2 border border-white/15 bg-[#3f5666]/82 p-2 text-sm shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <TabButton
          active={tab === "bookings"}
          onClick={() => switchTab("bookings")}
        >
          bookings
        </TabButton>
        <TabButton
          active={tab === "profile"}
          onClick={() => switchTab("profile")}
        >
          profile
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
      className={`flex-1 rounded-xl py-2 lowercase tracking-wide transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/40 ${
        active
          ? "bg-[#0d3350] text-[var(--color-beige)] shadow-inner"
          : "text-[var(--color-beige)]/70 hover:bg-[#0d3350]/40 hover:text-[var(--color-beige)]"
      }`}
    >
      {children}
    </button>
  );
}
