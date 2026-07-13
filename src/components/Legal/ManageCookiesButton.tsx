"use client";

import { useT } from "@/components/Language/useT";

const OPEN_COOKIE_BANNER_EVENT = "open-cookie-banner";

export default function ManageCookiesButton() {
  const t = useT();

  const openBanner = () => {
    try {
      localStorage.removeItem("cookie-consent-v1");
      window.dispatchEvent(new Event(OPEN_COOKIE_BANNER_EVENT));
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={openBanner}
      className="rounded-xl bg-[var(--color-beige)] px-4 py-2 font-semibold text-[var(--color-blue)] transition hover:bg-[#efe6d9]"
    >
      {t("manageCookies")}
    </button>
  );
}
