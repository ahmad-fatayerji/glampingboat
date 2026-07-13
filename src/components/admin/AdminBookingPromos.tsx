"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAdminT } from "./useAdminT";

type Promo = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  nightlyTtcCents: number;
  isActive: boolean;
};

function dateValue(value: string) {
  return value.slice(0, 10);
}

export default function AdminBookingPromos({ promos }: { promos: Promo[] }) {
  const router = useRouter();
  const t = useAdminT();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submitJson({
    url,
    method,
    formElement,
    busyKey,
  }: {
    url: string;
    method: "POST" | "PATCH";
    formElement: HTMLFormElement;
    busyKey: string;
  }) {
    const form = new FormData(formElement);
    const payload: Record<string, unknown> = Object.fromEntries(form.entries());
    payload.isActive = form.get("isActive") === "on";
    payload.nightlyTtc = Number(payload.nightlyTtc);
    setBusy(busyKey);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || t("actionImpossible"));
      }

      if (method === "POST") {
        formElement.reset();
      }
      setMessage(t("promotionSaved"));
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : t("error")
      );
    } finally {
      setBusy(null);
    }
  }

  async function createPromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitJson({
      url: "/api/admin/promos",
      method: "POST",
      formElement: event.currentTarget,
      busyKey: "create",
    });
  }

  async function updatePromo(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    await submitJson({
      url: `/api/admin/promos/${id}`,
      method: "PATCH",
      formElement: event.currentTarget,
      busyKey: id,
    });
  }

  async function deletePromo(id: string) {
    setBusy(id);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/promos/${id}`, {
        method: "DELETE",
      });
      const json = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || t("actionImpossible"));
      }

      setMessage(t("promotionDeleted"));
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t("error"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[24rem_1fr]">
      <form onSubmit={createPromo} className="admin-surface h-fit space-y-3 p-4">
        <h2 className="text-lg">{t("newPromotion")}</h2>
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
          {t("title")}
          <input name="title" required className="admin-input h-10 rounded-md px-3" />
        </label>
        <label className="grid gap-1 text-sm">
          {t("arrival")}
          <input
            name="startDate"
            type="date"
            required
            className="admin-input h-10 rounded-md px-3"
          />
        </label>
        <label className="grid gap-1 text-sm">
          {t("end")}
          <input
            name="endDate"
            type="date"
            required
            className="admin-input h-10 rounded-md px-3"
          />
        </label>
        <label className="grid gap-1 text-sm">
          {t("promoNightlyPrice")}
          <input
            name="nightlyTtc"
            type="number"
            min="1"
            step="0.01"
            defaultValue="195"
            required
            className="admin-input h-10 rounded-md px-3"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="isActive" type="checkbox" defaultChecked />
          {t("active")}
        </label>
        <button
          disabled={busy === "create"}
          className="admin-button rounded-md px-4 py-2 text-sm font-medium"
        >
          {t("addPromotion")}
        </button>
      </form>

      <section className="admin-surface p-4">
        <h2 className="mb-3 border-b border-[var(--admin-line)] pb-2 text-lg">
          {t("promotions")}
        </h2>
        <div className="grid gap-3">
          {promos.map((promo) => (
            <form
              key={promo.id}
              onSubmit={(event) => updatePromo(event, promo.id)}
              className="admin-row grid gap-3 rounded-md p-3 text-sm lg:grid-cols-[1fr_9rem_9rem_8rem_auto_auto]"
            >
              <input
                name="title"
                defaultValue={promo.title}
                className="admin-input h-10 rounded-md px-3"
              />
              <input
                name="startDate"
                type="date"
                defaultValue={dateValue(promo.startDate)}
                className="admin-input h-10 rounded-md px-3"
              />
              <input
                name="endDate"
                type="date"
                defaultValue={dateValue(promo.endDate)}
                className="admin-input h-10 rounded-md px-3"
              />
              <input
                name="nightlyTtc"
                type="number"
                min="1"
                step="0.01"
                defaultValue={(promo.nightlyTtcCents / 100).toFixed(2)}
                className="admin-input h-10 rounded-md px-3"
              />
              <label className="flex items-center gap-2">
                <input
                  name="isActive"
                  type="checkbox"
                  defaultChecked={promo.isActive}
                />
                {t("active")}
              </label>
              <div className="flex gap-2">
                <button
                  disabled={busy === promo.id}
                  className="admin-button rounded-md px-3 py-2 text-sm"
                >
                  {t("save")}
                </button>
                <button
                  type="button"
                  disabled={busy === promo.id}
                  onClick={() => deletePromo(promo.id)}
                  className="rounded-md border border-[#d9b9b4] px-3 py-2 text-sm text-[#ffd8d2] disabled:opacity-55"
                >
                  {t("delete")}
                </button>
              </div>
            </form>
          ))}
          {!promos.length && (
            <p className="admin-muted py-8 text-center text-sm">
              {t("noPromotions")}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
