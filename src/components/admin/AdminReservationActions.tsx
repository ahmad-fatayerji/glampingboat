"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { ReservationSerialized } from "@/lib/types";
import { ADMIN_RESERVATION_UPDATED_EVENT } from "./AdminReservationFinance";
import { useAdminT } from "./useAdminT";

export default function AdminReservationActions({
  reservationId,
  showGtcrBalanceCancel = false,
}: {
  reservationId: string;
  showGtcrBalanceCancel?: boolean;
}) {
  const router = useRouter();
  const t = useAdminT();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function submitJson(
    event: FormEvent<HTMLFormElement>,
    action: string,
    url: string
  ) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    setBusy(action);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(url, {
        method: action === "note" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await response.json().catch(() => ({}))) as {
        error?: string;
        reservation?: ReservationSerialized;
      };
      if (!response.ok) {
        throw new Error(json.error || t("actionImpossible"));
      }

      if (action === "manual-payment" && json.reservation) {
        window.dispatchEvent(
          new CustomEvent(ADMIN_RESERVATION_UPDATED_EVENT, {
            detail: json.reservation,
          })
        );
      }

      formElement.reset();
      setMessage(t("actionSaved"));
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : t("actionImpossible")
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {(message || error) && (
        <p
          role={error ? "alert" : "status"}
          className={`rounded-[var(--admin-radius-sm)] px-3 py-2 text-sm ${
            error
              ? "border border-[#b65c50] bg-[#5a1e1a]/70 text-[#ffe1dc]"
              : "border border-[#80a68d] bg-[#1f4c32]/70 text-[#e1f5e6]"
          }`}
        >
          {error || message}
        </p>
      )}

      <form
        onSubmit={(event) =>
          submitJson(event, "note", `/api/admin/reservations/${reservationId}`)
        }
        className="admin-card space-y-3 p-3.5"
      >
        <h3 className="text-sm font-semibold">{t("internalNote")}</h3>
        <textarea
          name="internalNote"
          required
          rows={3}
          className="admin-input resize-y px-3 py-2 text-sm"
          placeholder={t("adminNoteOnly")}
        />
        <button
          disabled={busy === "note"}
          className="admin-button w-full px-4 py-2 text-sm font-medium"
        >
          {busy === "note" ? `${t("addNote")}...` : t("addNote")}
        </button>
      </form>

      <form
        onSubmit={(event) =>
          submitJson(
            event,
            "manual-payment",
            `/api/admin/reservations/${reservationId}/manual-payment`
          )
        }
        className="admin-card grid min-w-0 gap-3 p-3.5"
      >
        <h3 className="text-sm font-semibold">{t("manualPayment")}</h3>
        <select name="purpose" required className="admin-input h-10 px-3 text-sm">
          <option value="DEPOSIT">{t("deposit")}</option>
          <option value="BALANCE">{t("balance")}</option>
          <option value="FULL">{t("fullPayment")}</option>
          <option value="SECURITY_DEPOSIT">{t("securityDeposit")}</option>
        </select>
        <input
          name="amount"
          required
          type="number"
          min="0.01"
          step="0.01"
          placeholder={t("amountEur")}
          className="admin-input h-10 px-3 text-sm"
        />
        <input
          name="note"
          placeholder={t("optionalNote")}
          className="admin-input h-10 px-3 text-sm"
        />
        <button
          disabled={busy === "manual-payment"}
          className="admin-button w-full px-4 py-2 text-sm font-medium"
        >
          {busy === "manual-payment" ? `${t("savePayment")}...` : t("savePayment")}
        </button>
      </form>

      {/* Destructive actions grouped last so they are never hit by accident. */}
      <div className="space-y-3 rounded-[var(--admin-radius-sm)] border border-[#d9b9b4] bg-[#5a1e1a]/35 p-3.5">
        {showGtcrBalanceCancel && (
          <form
            onSubmit={(event) =>
              submitJson(
                event,
                "cancel-gtcr",
                `/api/admin/reservations/${reservationId}/cancel`
              )
            }
            className="space-y-3 border-b border-[#d9b9b4]/40 pb-3"
          >
            <h3 className="text-sm font-semibold text-[#ffd8d2]">
              {t("gtcrBalanceLate")}
            </h3>
            <p className="text-xs leading-relaxed text-[#ffd8d2]/85">
              {t("gtcrBalanceLateBody")}
            </p>
            <input
              type="hidden"
              name="reason"
              value="GTCR balance unpaid after due date"
            />
            <button
              disabled={busy === "cancel-gtcr"}
              className="admin-danger-button w-full px-4 py-2 text-sm"
            >
              {busy === "cancel-gtcr" ? `${t("cancelForGtcr")}...` : t("cancelForGtcr")}
            </button>
          </form>
        )}

        <form
          onSubmit={(event) =>
            submitJson(
              event,
              "cancel",
              `/api/admin/reservations/${reservationId}/cancel`
            )
          }
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-[#ffd8d2]">
            {t("cancelReservation")}
          </h3>
          <input
            name="reason"
            required
            placeholder={t("requiredReason")}
            className="admin-input h-10 w-full px-3 text-sm"
          />
          <button
            disabled={busy === "cancel"}
            className="admin-danger-button w-full px-4 py-2 text-sm"
          >
            {busy === "cancel" ? `${t("confirmCancellation")}...` : t("confirmCancellation")}
          </button>
        </form>
      </div>
    </div>
  );
}
