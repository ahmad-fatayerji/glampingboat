"use client";

import { useEffect, useState } from "react";
import type { ReservationSerialized } from "@/lib/types";
import type { Locale } from "@/components/Language/dictionaries";
import {
  adminDateFormatter,
  adminMoneyFormatter,
  tAdmin,
} from "@/components/admin/admin-i18n";
import { Badge, InfoRow } from "@/components/admin/ui";

export const ADMIN_RESERVATION_UPDATED_EVENT = "admin-reservation-updated";

type FinanceReservation = Pick<
  ReservationSerialized,
  | "id"
  | "paidAmountCents"
  | "totalAmountTtcCents"
  | "baseAmountHtCents"
  | "optionsAmountHtCents"
  | "vatAmountCents"
  | "touristTaxAmountCents"
  | "depositAmountCents"
  | "balanceDueDate"
> & {
  balanceOverdue: boolean;
};

export default function AdminReservationFinance({
  locale,
  reservation,
  showTouristTaxBreakdown,
}: {
  locale: Locale;
  reservation: FinanceReservation;
  showTouristTaxBreakdown: boolean;
}) {
  const [current, setCurrent] = useState(reservation);
  const money = (cents: number) => adminMoneyFormatter(locale).format(cents / 100);
  const dateFmt = adminDateFormatter(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const fullyPaid = current.paidAmountCents >= current.totalAmountTtcCents;
  const outstandingCents = Math.max(
    current.totalAmountTtcCents - current.paidAmountCents,
    0
  );
  const paidRatio = current.totalAmountTtcCents
    ? Math.min(current.paidAmountCents / current.totalAmountTtcCents, 1)
    : 0;

  useEffect(() => {
    setCurrent(reservation);
  }, [reservation]);

  useEffect(() => {
    function updateFinance(event: Event) {
      const updated = (event as CustomEvent<ReservationSerialized>).detail;

      if (!updated || updated.id !== current.id) return;

      setCurrent((previous) => ({
        ...previous,
        ...updated,
        balanceOverdue:
          updated.balanceDueDate !== null &&
          updated.paidAmountCents < updated.totalAmountTtcCents &&
          new Date() > new Date(updated.balanceDueDate),
      }));
    }

    window.addEventListener(ADMIN_RESERVATION_UPDATED_EVENT, updateFinance);
    return () =>
      window.removeEventListener(ADMIN_RESERVATION_UPDATED_EVENT, updateFinance);
  }, [current.id]);

  return (
    <>
      <div className="admin-card mb-5 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="admin-eyebrow">{tAdmin(locale, "paid")}</p>
            <p className="mt-1.5 text-2xl font-semibold leading-none tabular-nums">
              {money(current.paidAmountCents)}
              <span className="admin-muted text-base font-normal">
                {" / "}
                {money(current.totalAmountTtcCents)}
              </span>
            </p>
          </div>
          <Badge tone={fullyPaid ? "ok" : current.balanceOverdue ? "warn" : "blue"}>
            {fullyPaid
              ? tAdmin(locale, "paidFull")
              : current.balanceOverdue
                ? tAdmin(locale, "balanceOverdue")
                : current.paidAmountCents > 0
                  ? tAdmin(locale, "paidDeposit")
                  : tAdmin(locale, "unpaid")}
          </Badge>
        </div>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-[rgba(228,219,206,0.15)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(paidRatio * 100)}
        >
          <div
            className={`h-full rounded-full ${fullyPaid ? "bg-[#80a68d]" : "bg-[#e4be75]"}`}
            style={{ width: `${Math.max(paidRatio * 100, 2)}%` }}
          />
        </div>
        {!fullyPaid ? (
          <p className="admin-muted mt-2.5 text-xs tabular-nums">
            {tAdmin(locale, "balance")}: {money(outstandingCents)}
            {current.balanceDueDate
              ? ` - ${dateFmt.format(new Date(current.balanceDueDate))}`
              : ""}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2.5">
        <InfoRow label={tAdmin(locale, "baseHt")} value={money(current.baseAmountHtCents)} />
        <InfoRow
          label={tAdmin(locale, "optionsHt")}
          value={money(current.optionsAmountHtCents)}
        />
        <InfoRow label={tAdmin(locale, "vat")} value={money(current.vatAmountCents)} />
        {showTouristTaxBreakdown && (
          <InfoRow
            label={tAdmin(locale, "touristTax")}
            value={money(current.touristTaxAmountCents)}
          />
        )}
        <InfoRow
          label={tAdmin(locale, "totalInclTax")}
          value={money(current.totalAmountTtcCents)}
        />
        <InfoRow label={tAdmin(locale, "deposit")} value={money(current.depositAmountCents)} />
      </div>
    </>
  );
}
