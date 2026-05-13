"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function AdminAvailabilityBlocks({
  blocks,
}: {
  blocks: Array<{
    id: string;
    startDate: string;
    endDate: string;
    type: string;
    reason: string;
    note: string | null;
  }>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/availability-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      const json = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || "Blocage impossible");
      }

      formElement.reset();
      setMessage("Blocage ajoute.");
      router.refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function deleteBlock(id: string) {
    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/availability-blocks/${id}`, {
        method: "DELETE",
      });
      const json = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || "Suppression impossible");
      }

      setMessage("Blocage supprime.");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[24rem_1fr]">
      <form
        onSubmit={createBlock}
        className="admin-surface h-fit space-y-3 p-4"
      >
        <h2 className="text-lg">Nouveau blocage</h2>
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
        <label className="grid gap-1 text-sm">
          Debut
          <input
            name="startDate"
            type="date"
            required
            className="admin-input h-10 rounded-md px-3"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Fin
          <input
            name="endDate"
            type="date"
            required
            className="admin-input h-10 rounded-md px-3"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Type
          <select
            name="type"
            className="admin-input h-10 rounded-md px-3"
          >
            <option value="MAINTENANCE">Maintenance</option>
            <option value="OWNER_USE">Usage proprietaire</option>
            <option value="CLEANING_BUFFER">Nettoyage</option>
            <option value="PRIVATE_HOLD">Option privee</option>
            <option value="OTHER">Autre</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Motif
          <input
            name="reason"
            required
            className="admin-input h-10 rounded-md px-3"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Note
          <textarea
            name="note"
            rows={3}
            className="admin-input rounded-md px-3 py-2"
          />
        </label>
        <button
          disabled={busy}
          className="admin-button rounded-md px-4 py-2 text-sm font-medium"
        >
          Bloquer les dates
        </button>
      </form>

      <section className="admin-surface p-4">
        <h2 className="mb-3 border-b border-[var(--admin-line)] pb-2 text-lg">
          Blocages actifs et futurs
        </h2>
        <div className="grid gap-2">
          {blocks.map((block) => (
            <article
              key={block.id}
              className="admin-row grid gap-2 rounded-md p-3 text-sm md:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{block.reason}</span>
                  <span className="admin-pill rounded-full px-2.5 py-1 text-xs">
                    {block.type}
                  </span>
                </div>
                <p className="admin-muted mt-1">
                  {block.startDate.slice(0, 10)} - {block.endDate.slice(0, 10)}
                </p>
                {block.note && <p className="mt-1">{block.note}</p>}
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => deleteBlock(block.id)}
                className="h-9 rounded-md border border-[#d9b9b4] px-3 text-sm text-[#ffd8d2] disabled:opacity-55"
              >
                Supprimer
              </button>
            </article>
          ))}
          {!blocks.length && (
            <p className="admin-muted py-8 text-center text-sm">
              Aucun blocage actif.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
