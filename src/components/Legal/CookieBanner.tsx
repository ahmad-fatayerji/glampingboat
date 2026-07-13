"use client";

import React, { startTransition, useEffect, useState } from "react";
import { useT } from "@/components/Language/useT";

type Preferences = {
  necessary: true;
};

const STORAGE_KEY = "cookie-consent-v1";
const OPEN_COOKIE_BANNER_EVENT = "open-cookie-banner";
const OPEN_COOKIE_POLICY_EVENT = "open-cookie-policy";

function loadPrefs(): Preferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    JSON.parse(raw);
    return { necessary: true };
  } catch {
    return null;
  }
}

export default function CookieBanner() {
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const existing = loadPrefs();
    if (!existing) {
      startTransition(() => {
        setOpen(true);
      });
    }
  }, []);

  useEffect(() => {
    const openBanner = () => setOpen(true);

    window.addEventListener(OPEN_COOKIE_BANNER_EVENT, openBanner);
    return () => {
      window.removeEventListener(OPEN_COOKIE_BANNER_EVENT, openBanner);
    };
  }, []);

  const save = (p: Preferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    setOpen(false);
  };

  const acknowledge = () => save({ necessary: true });
  const openPolicy = () => {
    setOpen(false);
    window.dispatchEvent(new Event(OPEN_COOKIE_POLICY_EVENT));
  };

  if (!open) return null;

  const primaryBtn =
    "inline-flex items-center rounded-xl bg-[#0d3350] px-5 py-2 text-sm text-[var(--color-beige)] transition hover:bg-[#123f61] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/60";
  const secondaryBtn =
    "inline-flex items-center rounded-xl border border-[#173c59] bg-transparent px-5 py-2 text-sm text-[var(--color-beige)] transition hover:bg-[#0d3350]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/60";

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
            <button
              type="button"
              className="font-medium underline decoration-[var(--color-beige)]/45 underline-offset-4 transition hover:decoration-[var(--color-beige)]"
              onClick={openPolicy}
            >
              {t("cookiePolicyLink")}
            </button>{" "}
            {t("cookieBannerBodyEnd")}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={acknowledge} className={primaryBtn}>
              {t("acceptAllCookies")}
            </button>
            <button type="button" onClick={acknowledge} className={secondaryBtn}>
              {t("rejectAllCookies")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
