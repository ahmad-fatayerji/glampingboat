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
    <section className="grid gap-4">
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
    <article className="admin-surface flex flex-wrap items-start justify-between gap-4 p-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-medium leading-tight">{flag.label}</h2>
          <span
            className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium leading-none ${
              enabled ? "admin-pill-ok" : "admin-pill"
            }`}
          >
            {enabled ? t("active") : t("disabled")}
          </span>
        </div>
        <p className="admin-muted mt-1.5 max-w-prose text-sm leading-relaxed">
          {flag.description}
        </p>
        <p className="admin-muted mt-2.5 text-xs">
          {t("lastUpdated", {
            date: new Date(flag.updatedAt).toLocaleString(ADMIN_INTL_LOCALE[locale]),
          })}
        </p>
        {error && (
          <p
            role="alert"
            className="mt-3 rounded-[var(--admin-radius-sm)] border border-[#b65c50] bg-[#5a1e1a]/70 px-3 py-2 text-sm text-[#ffe1dc]"
          >
            {error}
          </p>
        )}
      </div>

      {/* The badge above already states the value, so the switch is label-free. */}
      <label
        className={`inline-flex shrink-0 items-center ${saving ? "cursor-wait" : "cursor-pointer"}`}
      >
        <input
          type="checkbox"
          role="switch"
          checked={enabled}
          disabled={saving}
          aria-label={flag.label}
          onChange={(event) => toggleFlag(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`relative h-7 w-12 rounded-full border border-[var(--admin-line)] transition peer-disabled:opacity-55 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--admin-focus)] ${
            enabled ? "bg-[#7ea985]" : "bg-[var(--admin-field)]"
          }`}
        >
          <span
            className={`absolute left-1 top-1 size-5 rounded-full bg-[var(--color-beige)] transition-transform ${
              enabled ? "translate-x-5" : ""
            }`}
          />
        </span>
      </label>
    </article>
  );
}
