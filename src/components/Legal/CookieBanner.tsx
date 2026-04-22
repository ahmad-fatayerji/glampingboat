"use client";

import React, { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/components/Language/useT";

type Preferences = {
  necessary: true;
  analytics: boolean;
  performance: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "cookie-consent-v1";

function loadPrefs(): Preferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Preferences;
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      performance: !!parsed.performance,
      marketing: !!parsed.marketing,
    };
  } catch {
    return null;
  }
}

export default function CookieBanner() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>({
    necessary: true,
    analytics: false,
    performance: false,
    marketing: false,
  });

  useEffect(() => {
    const existing = loadPrefs();
    if (!existing) {
      startTransition(() => {
        setOpen(true);
      });
    }
  }, []);

  const save = (p: Preferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    setOpen(false);
  };

  const acceptAll = () =>
    save({
      necessary: true,
      analytics: true,
      performance: true,
      marketing: true,
    });
  const rejectAll = () =>
    save({
      necessary: true,
      analytics: false,
      performance: false,
      marketing: false,
    });
  const saveSelection = () => save(prefs);

  if (!open) return null;

  const primaryBtn =
    "inline-flex items-center rounded-xl bg-[#0d3350] px-5 py-2 text-sm text-[var(--color-beige)] transition hover:bg-[#123f61] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/60";
  const secondaryBtn =
    "inline-flex items-center rounded-xl border border-[#173c59] bg-transparent px-5 py-2 text-sm text-[var(--color-beige)] transition hover:bg-[#0d3350]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/60";
  const ghostBtn =
    "inline-flex items-center rounded-xl px-5 py-2 text-sm text-[var(--color-beige)]/85 underline decoration-[var(--color-beige)]/35 underline-offset-4 transition hover:text-[var(--color-beige)] hover:decoration-[var(--color-beige)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/60";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl border border-white/15 bg-[#3f5666]/82 text-[var(--color-beige)] shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <div className="p-4 sm:p-6">
          <div className="flex items-end gap-4 border-b border-[#173c59] pb-2">
            <h2 className="text-[1.05rem] tracking-wide text-[var(--color-beige)]">
              {t("cookies")}
            </h2>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-[var(--color-beige)]/86 sm:text-base">
            {t("cookieBannerBody")}{" "}
            <Link
              className="font-medium underline decoration-[var(--color-beige)]/45 underline-offset-4 transition hover:decoration-[var(--color-beige)]"
              href="/cookies"
            >
              {t("cookiePolicyLink")}
            </Link>{" "}
            {t("cookieBannerBodyEnd")}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={acceptAll} className={primaryBtn}>
              {t("acceptAllCookies")}
            </button>
            <button type="button" onClick={rejectAll} className={secondaryBtn}>
              {t("rejectAllCookies")}
            </button>
            <button
              type="button"
              onClick={() => setShowDetails((s) => !s)}
              className={ghostBtn}
            >
              {t("customizeCookies")}
            </button>
          </div>

          {showDetails && (
            <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <CookieChoice
                checked
                readOnly
                title={t("necessaryCookies")}
                body={t("necessaryCookiesBody")}
              />
              <CookieChoice
                id="analytics"
                checked={prefs.analytics}
                title={t("analyticsCookies")}
                body={t("analyticsCookiesBody")}
                onChange={(checked) =>
                  setPrefs((p) => ({ ...p, analytics: checked }))
                }
              />
              <CookieChoice
                id="performance"
                checked={prefs.performance}
                title={t("performanceCookies")}
                body={t("performanceCookiesBody")}
                onChange={(checked) =>
                  setPrefs((p) => ({ ...p, performance: checked }))
                }
              />
              <CookieChoice
                id="marketing"
                checked={prefs.marketing}
                title={t("marketingCookies")}
                body={t("marketingCookiesBody")}
                onChange={(checked) =>
                  setPrefs((p) => ({ ...p, marketing: checked }))
                }
              />
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={saveSelection}
                  className={primaryBtn}
                >
                  {t("saveCookieChoices")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CookieChoice({
  id,
  checked,
  readOnly = false,
  title,
  body,
  onChange,
}: {
  id?: string;
  checked: boolean;
  readOnly?: boolean;
  title: string;
  body: string;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] p-3 text-[var(--color-blue)]">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        readOnly={readOnly}
        className={`mt-1 h-4 w-4 accent-[#0d3350] ${
          readOnly ? "cursor-not-allowed" : ""
        }`}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <div>
        {id ? (
          <label htmlFor={id} className="cursor-pointer font-medium">
            {title}
          </label>
        ) : (
          <p className="font-medium">{title}</p>
        )}
        <p className="mt-1 text-[var(--color-blue)]/70">{body}</p>
      </div>
    </div>
  );
}
