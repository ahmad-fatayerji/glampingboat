"use client";

export default function ManageCookiesButton() {
  const reset = () => {
    try {
      localStorage.removeItem("cookie-consent-v1");
      window.location.reload();
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={reset}
      className="rounded-xl bg-[var(--color-beige)] px-4 py-2 font-semibold text-[var(--color-blue)] transition hover:bg-[#efe6d9]"
    >
      Gérer mes cookies
    </button>
  );
}
