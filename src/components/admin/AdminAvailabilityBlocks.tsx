"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useLanguage } from "@/components/Language/LanguageContext";
import { adminDateFormatter, availabilityBlockTypeLabel } from "./admin-i18n";
import { useAdminT } from "./useAdminT";
import { Badge, EmptyState } from "./ui";

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
  const { locale } = useLanguage();
  const t = useAdminT();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dateFmt = adminDateFormatter(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

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
        throw new Error(json.error || t("blockUnavailable"));
      }

      formElement.reset();
      setMessage(t("blockAdded"));
      router.refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : t("error"));
    } finally {
      setBusy(false);
    }
  }

  async function deleteBlock(id: string) {
    // Removing a block reopens those dates for booking — confirm first.
    if (!window.confirm(t("confirmDeleteBlock"))) return;

    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/availability-blocks/${id}`, {
        method: "DELETE",
      });
      const json = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || t("actionImpossible"));
      }

      setMessage(t("actionSaved"));
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t("error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[24rem_1fr]">
      <form onSubmit={createBlock} className="admin-surface h-fit overflow-hidden">
        <div className="border-b border-[var(--admin-line)] px-5 py-4">
          <h2 className="text-lg font-medium leading-tight">{t("newBlock")}</h2>
        </div>
        <div className="space-y-3.5 p-5">
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
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="admin-eyebrow">{t("arrival")}</span>
              <input name="startDate" type="date" required className="admin-input h-10 px-3 text-sm" />
            </label>
            <label className="grid gap-1.5">
              <span className="admin-eyebrow">{t("end")}</span>
              <input name="endDate" type="date" required className="admin-input h-10 px-3 text-sm" />
            </label>
          </div>
          <label className="grid gap-1.5">
            <span className="admin-eyebrow">{t("type")}</span>
            <select name="type" className="admin-input h-10 px-3 text-sm">
              <option value="MAINTENANCE">{t("blockTypeMaintenance")}</option>
              <option value="OWNER_USE">{t("blockTypeOwnerUse")}</option>
              <option value="CLEANING_BUFFER">{t("blockTypeCleaning")}</option>
              <option value="PRIVATE_HOLD">{t("blockTypePrivateHold")}</option>
              <option value="OTHER">{t("blockTypeOther")}</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="admin-eyebrow">{t("reason")}</span>
            <input name="reason" required className="admin-input h-10 px-3 text-sm" />
          </label>
          <label className="grid gap-1.5">
            <span className="admin-eyebrow">{t("note")}</span>
            <textarea name="note" rows={3} className="admin-input resize-y px-3 py-2 text-sm" />
          </label>
          <button disabled={busy} className="admin-button w-full px-4 py-2 text-sm font-medium">
            {busy ? `${t("blockDates")}…` : t("blockDates")}
          </button>
        </div>
      </form>

      <section className="admin-surface flex flex-col overflow-hidden">
        <div className="border-b border-[var(--admin-line)] px-5 py-4">
          <h2 className="text-lg font-medium leading-tight">{t("activeFutureBlocks")}</h2>
        </div>
        <div className="p-5">
          {blocks.length ? (
            <ul className="grid gap-2">
              {blocks.map((block) => (
                <li
                  key={block.id}
                  className="admin-row flex flex-wrap items-start justify-between gap-3 p-3.5 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{block.reason}</span>
                      <Badge>{availabilityBlockTypeLabel(locale, block.type)}</Badge>
                    </div>
                    <p className="admin-muted mt-1 text-xs tabular-nums">
                      {dateFmt.format(new Date(block.startDate))} &ndash;{" "}
                      {dateFmt.format(new Date(block.endDate))}
                    </p>
                    {block.note && (
                      <p className="admin-muted mt-1.5 text-xs leading-relaxed">
                        {block.note}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => deleteBlock(block.id)}
                    className="h-9 shrink-0 rounded-[var(--admin-radius-sm)] border border-[#d9b9b4] px-3 text-sm text-[#ffd8d2] transition hover:bg-[#5a1e1a]/50 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {t("delete")}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState label={t("noActiveBlocks")} />
          )}
        </div>
      </section>
    </div>
  );
}
