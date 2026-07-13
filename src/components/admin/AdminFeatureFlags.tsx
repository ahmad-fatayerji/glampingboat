"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FeatureFlagKey } from "@/lib/feature-flags";
import { useLanguage } from "@/components/Language/LanguageContext";
import { ADMIN_INTL_LOCALE } from "./admin-i18n";
import { useAdminT } from "./useAdminT";

type FeatureFlagView = {
  key: FeatureFlagKey;
  label: string;
  description: string;
  enabled: boolean;
  updatedAt: string;
};

export default function AdminFeatureFlags({
  flags,
}: {
  flags: FeatureFlagView[];
}) {
  return (
    <section className="grid gap-3">
      {flags.map((flag) => (
        <FeatureFlagRow key={flag.key} flag={flag} />
      ))}
    </section>
  );
}

function FeatureFlagRow({ flag }: { flag: FeatureFlagView }) {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = useAdminT();
  const [enabled, setEnabled] = useState(flag.enabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleFlag(nextEnabled: boolean) {
    setEnabled(nextEnabled);
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/feature-flags/${flag.key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      const json = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error || t("featureFlagUpdateFailed"));
      }

      router.refresh();
    } catch (flagError) {
      setEnabled(!nextEnabled);
      setError(flagError instanceof Error ? flagError.message : t("error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="admin-surface grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg">{flag.label}</h2>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              enabled ? "admin-pill-ok" : "admin-pill-warn"
            }`}
          >
            {enabled ? t("active") : t("disabled")}
          </span>
        </div>
        <p className="admin-muted mt-1 text-sm">{flag.description}</p>
        <p className="admin-muted mt-2 text-xs">
          {t("lastUpdated", {
            date: new Date(flag.updatedAt).toLocaleString(ADMIN_INTL_LOCALE[locale]),
          })}
        </p>
        {error && <p className="mt-2 text-sm text-[#ffd8d2]">{error}</p>}
      </div>

      <label className="inline-flex cursor-pointer items-center gap-3 justify-self-start md:justify-self-end">
        <span className="admin-muted text-sm">
          {enabled ? t("active") : t("inactive")}
        </span>
        <input
          type="checkbox"
          checked={enabled}
          disabled={saving}
          onChange={(event) => toggleFlag(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`relative h-7 w-12 rounded-full border border-[var(--admin-line)] transition peer-disabled:opacity-55 ${
            enabled ? "bg-[#7ea985]" : "bg-[var(--admin-field)]"
          }`}
        >
          <span
            className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-[var(--color-beige)] transition ${
              enabled ? "translate-x-5" : ""
            }`}
          />
        </span>
      </label>
    </article>
  );
}
