"use client";
import { useState } from "react";
import CredentialsSignIn from "./CredentialsSignIn";
import CredentialsSignUp from "./CredentialsSignUp";
import { useT } from "@/components/Language/useT";

export default function CredentialsTabs() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const t = useT();

  return (
    <div className="space-y-6">
      <h1 className="border-b border-[#173c59] pb-2 text-center text-[1.3rem] lowercase tracking-wide text-[var(--color-beige)]">
        {mode === "signin" ? t("authSignIn") : t("authCreateAccount")}
      </h1>
      <div className="grid grid-cols-2 rounded-xl border border-[#0d3350] bg-[#0d3350]/30 p-1 text-sm lowercase tracking-wide">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`rounded-lg py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/40 ${
            mode === "signin"
              ? "bg-[#0d3350] text-[var(--color-beige)] shadow-inner"
              : "text-[var(--color-beige)]/70 hover:text-[var(--color-beige)]"
          }`}
        >
          {t("authSignIn")}
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-lg py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/40 ${
            mode === "signup"
              ? "bg-[#0d3350] text-[var(--color-beige)] shadow-inner"
              : "text-[var(--color-beige)]/70 hover:text-[var(--color-beige)]"
          }`}
        >
          {t("authCreate")}
        </button>
      </div>
      {mode === "signin" ? <CredentialsSignIn /> : <CredentialsSignUp />}
    </div>
  );
}
