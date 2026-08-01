"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/Language/useT";

export default function VerifyEmailPage() {
  const t = useT();
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<"idle" | "working" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  const verify = async () => {
    setState("working");
    const response = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const result = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    if (!response.ok) {
      setError(result.error ?? t("verifyEmailFailed"));
      setState("error");
      return;
    }
    setState("success");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-40 pb-12">
      <div className="w-full max-w-md space-y-5 border border-white/15 bg-[#3f5666]/92 p-8 text-center text-[var(--color-beige)]">
        <h1 className="text-2xl">{t("verifyEmailTitle")}</h1>
        {state === "success" ? (
          <>
            <p>{t("verifyEmailSuccess")}</p>
            <Link href="/account" className="inline-block rounded-xl bg-[#0d3350] px-6 py-2">
              {t("verifyEmailContinue")}
            </Link>
          </>
        ) : (
          <>
            <p>{t("verifyEmailPrompt")}</p>
            {state === "error" && <p className="text-[#ffd9d9]">{error}</p>}
            <button
              type="button"
              onClick={verify}
              disabled={state === "working"}
              className="rounded-xl bg-[#0d3350] px-6 py-2 disabled:opacity-60"
            >
              {state === "working" ? t("verifyEmailWorking") : t("verifyEmailAction")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
