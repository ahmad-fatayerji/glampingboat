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
      onClick={reset}
      className="mt-4 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
    >
      Gérer mes cookies
    </button>
  );
}
