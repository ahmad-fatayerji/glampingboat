"use client";
import { useState }          from "react";
import { useRouter, useParams } from "next/navigation";
import { useT } from "@/components/Language/useT";
import { validatePasswordPolicy } from "@/lib/password-policy";
import PasswordRequirements from "@/components/auth/PasswordRequirements";

export default function ResetPasswordPage() {
  const t = useT();
  const { token } = useParams() as { token: string };
  const [pw, setPw]           = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [msg, setMsg]         = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const router                 = useRouter();
  const passwordPolicy = validatePasswordPolicy(pw);
  const passwordsMatch = pw === confirmPw;
  const canSubmit = passwordPolicy.valid && passwordsMatch && Boolean(pw);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);

    if (!passwordPolicy.valid) {
      setError(t("passwordPolicyError"));
      return;
    }

    if (!passwordsMatch) {
      setError(t("passwordMismatch"));
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: pw }),
    });

    if (res.ok) {
      setMsg(t("passwordResetSuccess"));
      setTimeout(() => router.push("/account"), 1500);
    } else {
      const { error } = await res.json();
      setError(error || t("genericError"));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl mb-4">{t("resetPassword")}</h1>
      {msg   && <div className="mb-4 p-2 bg-green-100 rounded">{msg}</div>}
      {error && <div className="mb-4 p-2 bg-red-100 rounded">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <input
          type="password"
          placeholder={t("newPassword")}
          className="w-full border p-2 rounded"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
        />
        <PasswordRequirements password={pw} tone="light" />
        <input
          type="password"
          placeholder={t("confirmPassword")}
          className="w-full border p-2 rounded"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          required
        />
        {confirmPw && !passwordsMatch && (
          <p className="text-sm text-red-700">{t("passwordMismatch")}</p>
        )}
        <button
          disabled={!canSubmit}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t("resetPassword")}
        </button>
      </form>
    </div>
  );
}
