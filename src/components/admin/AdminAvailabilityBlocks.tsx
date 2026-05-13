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
    const form = new FormData(event.currentTarget);
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

      event.currentTarget.reset();
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
        className="h-fit space-y-3 border border-[#d9cbb8] bg-white/88 p-4 shadow-[0_10px_30px_rgba(16,43,63,0.08)]"
      >
        <h2 className="text-lg">Nouveau blocage</h2>
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
        <label className="grid gap-1 text-sm">
          Debut
          <input
            name="startDate"
            type="date"
            required
            className="h-10 rounded-md border border-[#cdbda8] bg-[#fbf8f3] px-3"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Fin
          <input
            name="endDate"
            type="date"
            required
            className="h-10 rounded-md border border-[#cdbda8] bg-[#fbf8f3] px-3"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Type
          <select
            name="type"
            className="h-10 rounded-md border border-[#cdbda8] bg-[#fbf8f3] px-3"
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
            className="h-10 rounded-md border border-[#cdbda8] bg-[#fbf8f3] px-3"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Note
          <textarea
            name="note"
            rows={3}
            className="rounded-md border border-[#cdbda8] bg-[#fbf8f3] px-3 py-2"
          />
        </label>
        <button
          disabled={busy}
          className="rounded-md bg-[#102b3f] px-4 py-2 text-sm text-white disabled:opacity-55"
        >
          Bloquer les dates
        </button>
      </form>

      <section className="border border-[#d9cbb8] bg-white/88 p-4 shadow-[0_10px_30px_rgba(16,43,63,0.08)]">
        <h2 className="mb-3 border-b border-[#d9cbb8] pb-2 text-lg">
          Blocages actifs et futurs
        </h2>
        <div className="grid gap-2">
          {blocks.map((block) => (
            <article
              key={block.id}
              className="grid gap-2 rounded-md border border-[#d9cbb8] bg-[#fbf8f3] p-3 text-sm md:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{block.reason}</span>
                  <span className="rounded-full bg-[#e9dfd1] px-2.5 py-1 text-xs">
                    {block.type}
                  </span>
                </div>
                <p className="mt-1 text-[#637687]">
                  {block.startDate.slice(0, 10)} - {block.endDate.slice(0, 10)}
                </p>
                {block.note && <p className="mt-1 text-[#344b5b]">{block.note}</p>}
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => deleteBlock(block.id)}
                className="h-9 rounded-md border border-[#d9b9b4] px-3 text-sm text-[#8f3128] disabled:opacity-55"
              >
                Supprimer
              </button>
            </article>
          ))}
          {!blocks.length && (
            <p className="py-8 text-center text-sm text-[#637687]">
              Aucun blocage actif.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
