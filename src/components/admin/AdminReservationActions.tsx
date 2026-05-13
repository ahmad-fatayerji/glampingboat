"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function AdminReservationActions({
  reservationId,
}: {
  reservationId: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function submitJson(
    event: FormEvent<HTMLFormElement>,
    action: string,
    url: string
  ) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
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
      const json = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || "Action impossible");
      }

      event.currentTarget.reset();
      setMessage("Action enregistree.");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Action impossible"
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {(message || error) && (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
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
        className="admin-card space-y-3 rounded-md p-3"
      >
        <h3 className="text-sm font-semibold">Note interne</h3>
        <textarea
          name="internalNote"
          required
          rows={3}
          className="admin-input w-full rounded-md px-3 py-2 text-sm"
          placeholder="Information visible uniquement par les admins"
        />
        <button
          disabled={busy === "note"}
          className="admin-button rounded-md px-4 py-2 text-sm font-medium"
        >
          Ajouter la note
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
        className="admin-card grid gap-3 rounded-md p-3 md:grid-cols-[1fr_1fr]"
      >
        <h3 className="md:col-span-2 text-sm font-semibold">Paiement manuel</h3>
        <select
          name="purpose"
          required
          className="admin-input h-10 rounded-md px-3 text-sm"
        >
          <option value="DEPOSIT">Acompte</option>
          <option value="BALANCE">Solde</option>
          <option value="FULL">Paiement complet</option>
          <option value="SECURITY_DEPOSIT">Depot de garantie</option>
        </select>
        <input
          name="amount"
          required
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Montant EUR"
          className="admin-input h-10 rounded-md px-3 text-sm"
        />
        <input
          name="note"
          placeholder="Note facultative"
          className="admin-input h-10 rounded-md px-3 text-sm md:col-span-2"
        />
        <button
          disabled={busy === "manual-payment"}
          className="admin-button rounded-md px-4 py-2 text-sm font-medium md:w-fit"
        >
          Enregistrer le paiement
        </button>
      </form>

      <form
        onSubmit={(event) =>
          submitJson(
            event,
            "cancel",
            `/api/admin/reservations/${reservationId}/cancel`
          )
        }
        className="space-y-3 rounded-md border border-[#d9b9b4] bg-[#5a1e1a]/35 p-3"
      >
        <h3 className="text-sm font-semibold text-[#ffd8d2]">
          Annuler la reservation
        </h3>
        <input
          name="reason"
          required
          placeholder="Motif obligatoire"
          className="admin-input h-10 w-full rounded-md px-3 text-sm"
        />
        <button
          disabled={busy === "cancel"}
          className="admin-danger-button rounded-md px-4 py-2 text-sm disabled:opacity-55"
        >
          Confirmer l&apos;annulation
        </button>
      </form>
    </div>
  );
}
