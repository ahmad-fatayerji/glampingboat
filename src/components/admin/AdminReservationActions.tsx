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
              ? "border border-[#b65c50] bg-[#fff0ee] text-[#8f3128]"
              : "border border-[#80a68d] bg-[#eef8f1] text-[#2d6840]"
          }`}
        >
          {error || message}
        </p>
      )}

      <form
        onSubmit={(event) =>
          submitJson(event, "note", `/api/admin/reservations/${reservationId}`)
        }
        className="space-y-3 rounded-md border border-[#d9cbb8] bg-[#fbf8f3] p-3"
      >
        <h3 className="text-sm font-semibold">Note interne</h3>
        <textarea
          name="internalNote"
          required
          rows={3}
          className="w-full rounded-md border border-[#cdbda8] bg-white px-3 py-2 text-sm outline-none focus:border-[#527086]"
          placeholder="Information visible uniquement par les admins"
        />
        <button
          disabled={busy === "note"}
          className="rounded-md bg-[#102b3f] px-4 py-2 text-sm text-white disabled:opacity-55"
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
        className="grid gap-3 rounded-md border border-[#d9cbb8] bg-[#fbf8f3] p-3 md:grid-cols-[1fr_1fr]"
      >
        <h3 className="md:col-span-2 text-sm font-semibold">Paiement manuel</h3>
        <select
          name="purpose"
          required
          className="h-10 rounded-md border border-[#cdbda8] bg-white px-3 text-sm"
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
          className="h-10 rounded-md border border-[#cdbda8] bg-white px-3 text-sm"
        />
        <input
          name="note"
          placeholder="Note facultative"
          className="h-10 rounded-md border border-[#cdbda8] bg-white px-3 text-sm md:col-span-2"
        />
        <button
          disabled={busy === "manual-payment"}
          className="rounded-md bg-[#102b3f] px-4 py-2 text-sm text-white disabled:opacity-55 md:w-fit"
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
        className="space-y-3 rounded-md border border-[#d9b9b4] bg-[#fff7f5] p-3"
      >
        <h3 className="text-sm font-semibold text-[#8f3128]">
          Annuler la reservation
        </h3>
        <input
          name="reason"
          required
          placeholder="Motif obligatoire"
          className="h-10 w-full rounded-md border border-[#d9b9b4] bg-white px-3 text-sm"
        />
        <button
          disabled={busy === "cancel"}
          className="rounded-md bg-[#8f3128] px-4 py-2 text-sm text-white disabled:opacity-55"
        >
          Confirmer l&apos;annulation
        </button>
      </form>
    </div>
  );
}
