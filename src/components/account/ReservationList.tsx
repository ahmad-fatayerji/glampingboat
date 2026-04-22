"use client";

import { useState } from "react";
import { useT } from "@/components/Language/useT";
import { getErrorMessage, readJsonResponse } from "@/lib/http";
import type { ApiErrorResponse, ReservationSerialized } from "@/lib/types";

function fmt(dateIso: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(dateIso).toLocaleDateString(undefined, opts);
}

function nightsBetween(startIso: string, endIso: string) {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return Math.round(ms / 86400000);
}

const euro = (value: number) => `\u20AC${value.toFixed(2)}`;

interface Props {
  reservations: ReservationSerialized[];
}

export default function ReservationList({ reservations }: Props) {
  const t = useT();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [list, setList] = useState(reservations);
  const [pendingCancel, setPendingCancel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = Date.now();
  const filtered = list.filter((reservation) => {
    const end = new Date(reservation.endDate).getTime();
    const upcoming = end >= now - 86400000;
    if (filter === "all") return true;
    if (filter === "upcoming") return upcoming;
    return !upcoming;
  });

  if (!list.length) {
    return (
      <div className="border border-white/15 bg-[#3f5666]/82 p-12 text-center shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <p className="text-sm tracking-wide text-[var(--color-beige)]/80">
          {t("noReservationsYet")}
        </p>
      </div>
    );
  }

  async function handleCancel(id: string) {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/reservations/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const json = await readJsonResponse<ApiErrorResponse>(response, {
          error: t("failedToCancel"),
        });
        throw new Error(json.error || t("failedToCancel"));
      }

      setList((current) => current.filter((reservation) => reservation.id !== id));
      setPendingCancel(null);
    } catch (cancelError) {
      setError(getErrorMessage(cancelError, t("unexpectedError")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 border border-white/15 bg-[#3f5666]/82 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-6">
      <div className="flex flex-col gap-4 border-b border-[#173c59] pb-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-[1.05rem] tracking-wide text-[var(--color-beige)]">
          {t("reservations")}
        </h2>
        <div className="inline-flex rounded-xl border border-[#0d3350] bg-[#0d3350]/30 p-1 text-[11px] tracking-wider">
          {(["upcoming", "past", "all"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-lg px-4 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/40 ${
                filter === value
                  ? "bg-[#0d3350] text-[var(--color-beige)] shadow-inner"
                  : "text-[var(--color-beige)]/60 hover:text-[var(--color-beige)]"
              }`}
              aria-pressed={filter === value}
            >
              {value === "upcoming"
                ? t("filterUpcoming")
                : value === "past"
                  ? t("filterPast")
                  : t("filterAll")}
            </button>
          ))}
        </div>
      </div>
      <ul className="space-y-3">
        {filtered.map((reservation) => {
          const nights = nightsBetween(reservation.startDate, reservation.endDate);
          const isExpanded = expanded === reservation.id;
          const endPast = new Date(reservation.endDate).getTime() < now - 86400000;
          const status = endPast ? "past" : "upcoming";

          return (
            <li key={reservation.id} className="group">
              <div className="overflow-hidden border border-[#173c59] bg-[#0d3350]/25 transition group-hover:border-[#234d69]">
                <button
                  onClick={() => setExpanded(isExpanded ? null : reservation.id)}
                  className="flex w-full flex-col gap-3 px-5 py-4 text-left md:flex-row md:items-center md:gap-6"
                  aria-expanded={isExpanded}
                >
                  <div className="flex flex-1 flex-col md:flex-row md:items-center md:gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                      <span className="tracking-wide text-[var(--color-beige)]">
                        {fmt(reservation.startDate, {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                        <span className="mx-1 text-[var(--color-beige)]/40">&mdash;</span>
                        {fmt(reservation.endDate, {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="mt-1 flex flex-col text-[10px] tracking-wider text-[var(--color-beige)]/60 sm:mt-0 sm:flex-row sm:items-center sm:gap-2">
                        <span>
                          {nights}{" "}
                          {nights === 1 ? t("nightSingular") : t("nightPlural")}
                        </span>
                        {reservation.bookingRef && (
                          <span className="rounded border border-[#173c59] bg-[#0d3350]/60 px-2 py-0.5 font-mono text-[9px] tracking-tight text-[var(--color-beige)]/80">
                            {reservation.bookingRef}
                          </span>
                        )}
                      </span>
                    </div>
                    <StatusBadge
                      label={endPast ? t("past") : t("upcoming")}
                      status={status}
                    />
                  </div>
                  <div className="flex items-center gap-8 pr-1 text-sm">
                    <span className="tabular-nums text-[var(--color-beige)]">
                      {euro(reservation.totalTtc)}
                    </span>
                    <span className="text-xs text-[var(--color-beige)]/60">
                      {reservation.adults} {t("adultsShort")}
                      {reservation.children > 0
                        ? ` +${reservation.children} ${t("childrenShort")}`
                        : ""}
                    </span>
                    <svg
                      className={`h-4 w-4 text-[var(--color-beige)]/70 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${
                    isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-5 border-t border-[#173c59] bg-[#0d3350]/15 px-6 pb-6 pt-4 text-sm">
                      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
                        <Info label={t("baseHt")} value={euro(reservation.basePriceHt)} />
                        <Info
                          label={t("optionsHt")}
                          value={euro(reservation.optionsPriceHt)}
                        />
                        <Info label={t("tvaHt")} value={euro(reservation.tvaHt)} />
                        <Info
                          label={t("touristTax")}
                          value={euro(reservation.taxSejourTtc)}
                        />
                        <Info
                          label={t("deposit")}
                          value={euro(reservation.depositAmount)}
                        />
                        <Info
                          label={t("balance")}
                          value={euro(reservation.balanceAmount)}
                        />
                      </div>
                      {reservation.items.length > 0 && (
                        <div>
                          <h3 className="mb-2 text-[10px] tracking-wider text-[var(--color-beige)]/60">
                            {t("options")}
                          </h3>
                          <ul className="space-y-1 text-[var(--color-beige)]/90">
                            {reservation.items.map((item) => (
                              <li
                                key={item.id}
                                className="flex justify-between"
                              >
                                <span>
                                  {item.option.name} &times; {item.quantity}
                                </span>
                                <span className="tabular-nums">
                                  {euro(item.totalPriceHt)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex flex-col gap-2 border-t border-[#173c59] pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="flex flex-col text-[11px] text-[var(--color-beige)]/60 sm:flex-row sm:items-center sm:gap-3">
                          <span>
                            {t("created")}{" "}
                            {fmt(reservation.createdAt, {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {reservation.bookingRef && (
                            <span className="rounded border border-[#173c59] bg-[#0d3350]/60 px-2 py-0.5 font-mono text-[10px] text-[var(--color-beige)]/80">
                              {t("ref")}: {reservation.bookingRef}
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => setPendingCancel(reservation.id)}
                          className="self-start text-[11px] tracking-wide text-[#ffd9d9] underline underline-offset-2 transition hover:text-[#ffbfbf] disabled:opacity-40 sm:self-auto"
                          disabled={busy}
                        >
                          {t("cancelReservation")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <CancelDialog
        open={!!pendingCancel}
        onClose={() => {
          if (!busy) {
            setPendingCancel(null);
            setError(null);
          }
        }}
        onConfirm={() => pendingCancel && handleCancel(pendingCancel)}
        busy={busy}
        error={error}
        t={t}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] tracking-wider text-[var(--color-beige)]/55">
        {label}
      </div>
      <div className="tabular-nums text-[var(--color-beige)]">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({
  label,
  status,
}: {
  label: string;
  status: "upcoming" | "past";
}) {
  const isPast = status === "past";
  return (
    <span
      className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] tracking-wider ring-1 md:mt-0 ${
        isPast
          ? "bg-transparent text-[var(--color-beige)]/50 ring-[var(--color-beige)]/25"
          : "bg-[#0d3350] text-[var(--color-beige)] ring-[#234d69]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isPast ? "bg-[var(--color-beige)]/40" : "bg-[var(--color-beige)]"
        }`}
      />
      {label}
    </span>
  );
}

interface CancelDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
  error: string | null;
  t: ReturnType<typeof useT>;
}

function CancelDialog({
  open,
  onClose,
  onConfirm,
  busy,
  error,
  t,
}: CancelDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-title"
    >
      <div className="w-full max-w-sm border border-white/15 bg-[#3f5666]/92 text-[var(--color-beige)] shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm animate-[fadeIn_.25s_ease]">
        <div className="space-y-4 px-6 pb-5 pt-5">
          <h2
            id="cancel-title"
            className="border-b border-[#173c59] pb-2 text-[1.05rem] tracking-wide text-[var(--color-beige)]"
          >
            {t("cancelReservationQuestion")}
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-beige)]/80">
            {t("cancelReservationBody")}
          </p>
          {error && (
            <div className="rounded-md border border-[#8a3a30] bg-[#8a3a30]/25 px-3 py-2 text-xs text-[#ffd9d9]">
              {error}
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={busy}
              className="rounded-xl border border-[#173c59] px-4 py-2 text-sm tracking-wide text-[var(--color-beige)] transition hover:bg-[#0d3350]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/40 disabled:opacity-40"
            >
              {t("keep")}
            </button>
            <button
              onClick={onConfirm}
              disabled={busy}
              className="rounded-xl bg-[#8a3a30] px-5 py-2 text-sm tracking-wide text-[var(--color-beige)] shadow transition hover:bg-[#9e4237] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd9d9]/60 disabled:opacity-50"
            >
              {busy ? t("cancelling") : t("cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
