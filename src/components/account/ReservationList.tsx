"use client";
import { useState, useMemo } from "react";
// Lightweight date helpers (avoid adding a dependency)
function fmt(dateIso: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(dateIso).toLocaleDateString(undefined, opts);
}
function nightsBetween(startIso: string, endIso: string) {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return Math.round(ms / 86400000);
}
const euro = (n: number) => `€${n.toFixed(2)}`;

interface ReservationOptionSerialized {
  id: string;
  optionId: string;
  reservationId: string;
  quantity: number;
  totalPriceHt: number;
  option: {
    id: string;
    name: string;
    priceHt: number;
    description: string | null;
  };
}

export interface ReservationSerialized {
  id: string;
  userId: string;
  startDate: string; // ISO
  endDate: string; // ISO
  adults: number;
  children: number;
  basePriceHt: number;
  optionsPriceHt: number;
  subtotalHt: number;
  tvaHt: number;
  taxSejourTtc: number;
  totalTtc: number;
  depositAmount: number;
  balanceAmount: number;
  securityDeposit: number;
  createdAt: string;
  items: ReservationOptionSerialized[];
}

interface Props {
  reservations: ReservationSerialized[];
}

export default function ReservationList({ reservations }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [list, setList] = useState(reservations);
  const [pendingCancel, setPendingCancel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = Date.now();
  const filtered = useMemo(() => {
    return list.filter((r) => {
      const end = new Date(r.endDate).getTime();
      const upcoming = end >= now - 86400000; // treat current & future as upcoming
      if (filter === "all") return true;
      if (filter === "upcoming") return upcoming;
      return !upcoming;
    });
  }, [list, filter, now]);

  if (!list.length) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-[var(--color-blue)]/10 shadow-sm">
        <p className="text-sm text-[var(--color-blue)]/70 tracking-wide">
          You have no reservations yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-blue)] tracking-wide">
          Reservations
        </h2>
        <div className="inline-flex rounded-full bg-[var(--color-beige)]/60 p-1 shadow-inner ring-1 ring-[var(--color-blue)]/10 text-[11px] font-medium uppercase tracking-wider">
          {(["upcoming", "past", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)]/40 ${
                filter === f
                  ? "bg-[var(--color-blue)] text-[var(--color-beige)] shadow"
                  : "text-[var(--color-blue)]/60 hover:text-[var(--color-blue)]"
              }`}
              aria-pressed={filter === f}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <ul className="space-y-4">
        {filtered.map((r) => {
          const nights = nightsBetween(r.startDate, r.endDate);
          const isExpanded = expanded === r.id;
          const endPast = new Date(r.endDate).getTime() < now - 86400000;
          const status = endPast ? "past" : "upcoming";
          return (
            <li key={r.id} className="group">
              <div className="rounded-2xl border border-[var(--color-blue)]/10 bg-white shadow-sm overflow-hidden ring-1 ring-transparent group-hover:ring-[var(--color-blue)]/10 transition">
                <button
                  onClick={() => setExpanded(isExpanded ? null : r.id)}
                  className="w-full flex flex-col gap-3 text-left px-5 py-4 md:flex-row md:items-center md:gap-6"
                  aria-expanded={isExpanded}
                >
                  <div className="flex-1 flex flex-col md:flex-row md:items-center md:gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                      <span className="font-medium tracking-wide text-[var(--color-blue)]">
                        {fmt(r.startDate, {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                        <span className="mx-1 text-[var(--color-blue)]/40">
                          —
                        </span>
                        {fmt(r.endDate, {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-blue)]/50 mt-1 sm:mt-0">
                        {nights} night{nights !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <div className="flex items-center gap-8 text-sm pr-1">
                    <span className="font-semibold text-[var(--color-blue)] tabular-nums">
                      {euro(r.totalTtc)}
                    </span>
                    <span className="text-[var(--color-blue)]/60 text-xs">
                      {r.adults}A{r.children > 0 ? `+${r.children}C` : ""}
                    </span>
                    <svg
                      className={`w-4 h-4 text-[var(--color-blue)]/70 transition-transform ${
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
                    <div className="px-6 pb-6 pt-1 bg-white text-sm space-y-5">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                        <Info label="Base HT" value={euro(r.basePriceHt)} />
                        <Info
                          label="Options HT"
                          value={euro(r.optionsPriceHt)}
                        />
                        <Info label="TVA HT" value={euro(r.tvaHt)} />
                        <Info
                          label="Taxe séjour"
                          value={euro(r.taxSejourTtc)}
                        />
                        <Info label="Deposit" value={euro(r.depositAmount)} />
                        <Info label="Balance" value={euro(r.balanceAmount)} />
                      </div>
                      {r.items.length > 0 && (
                        <div>
                          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-blue)]/60 mb-2">
                            Options
                          </h3>
                          <ul className="space-y-1">
                            {r.items.map((it) => (
                              <li key={it.id} className="flex justify-between">
                                <span>
                                  {it.option.name} × {it.quantity}
                                </span>
                                <span className="tabular-nums">
                                  {euro(it.totalPriceHt)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-[var(--color-blue)]/10">
                        <span className="text-[11px] text-[var(--color-blue)]/60">
                          Created{" "}
                          {fmt(r.createdAt, {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <button
                          onClick={() => setPendingCancel(r.id)}
                          className="self-start sm:self-auto text-[11px] font-medium text-red-600 hover:text-red-700 underline underline-offset-2 disabled:opacity-40"
                          disabled={busy}
                        >
                          Cancel reservation
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
      />
    </div>
  );

  async function handleCancel(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/reservations/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to cancel");
      }
      setList((prev) => prev.filter((r) => r.id !== id));
      setPendingCancel(null);
    } catch (e: any) {
      setError(e.message || "Unexpected error");
    } finally {
      setBusy(false);
    }
  }
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-blue)]/45 font-semibold">
        {label}
      </div>
      <div className="font-medium tabular-nums text-[var(--color-blue)]">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "upcoming" | "past" }) {
  const isPast = status === "past";
  return (
    <span
      className={`mt-2 md:mt-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ring-1 ${
        isPast
          ? "bg-white text-[var(--color-blue)]/40 ring-[var(--color-blue)]/20"
          : "bg-[var(--color-blue)] text-[var(--color-beige)] ring-[var(--color-blue)]/30"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isPast ? "bg-[var(--color-blue)]/30" : "bg-[var(--color-beige)]"
        }`}
      />
      {isPast ? "Past" : "Upcoming"}
    </span>
  );
}

interface CancelDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
  error: string | null;
}

function CancelDialog({
  open,
  onClose,
  onConfirm,
  busy,
  error,
}: CancelDialogProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[var(--color-blue)]/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-[var(--color-blue)]/10 ring-1 ring-[var(--color-blue)]/10 animate-[fadeIn_.25s_ease]">
        <div className="px-6 pt-5 pb-4 space-y-4">
          <h2
            id="cancel-title"
            className="text-lg font-semibold tracking-wide text-[var(--color-blue)]"
          >
            Cancel reservation?
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-blue)]/70">
            This action will permanently remove the reservation. This cannot be
            undone.
          </p>
          {error && (
            <div className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2 text-sm font-medium rounded-md bg-[var(--color-beige)]/70 text-[var(--color-blue)] hover:bg-[var(--color-beige)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)]/40 disabled:opacity-40"
            >
              Keep
            </button>
            <button
              onClick={onConfirm}
              disabled={busy}
              className="relative px-5 py-2 text-sm font-semibold rounded-md bg-red-600 text-white shadow hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50"
            >
              {busy ? "Cancelling…" : "Cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
