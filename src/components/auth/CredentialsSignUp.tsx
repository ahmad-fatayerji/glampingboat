"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useT } from "@/components/Language/useT";

export default function CredentialsSignUp() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) setError(res.error);
    else window.location.href = "/";
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {error && (
        <p className="rounded-md border border-[#8a3a30] bg-[#8a3a30]/25 px-3 py-2 text-sm text-[#ffd9d9]">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-[var(--color-beige)]/90">
          {t("email")}
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] px-3 text-sm text-[var(--color-blue)] outline-none transition placeholder:text-[var(--color-blue)]/45 focus:border-[#234d69]"
          placeholder={t("authEmailPlaceholder")}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-[var(--color-beige)]/90">
          {t("password")}
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 w-full rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] px-3 text-sm text-[var(--color-blue)] outline-none transition placeholder:text-[var(--color-blue)]/45 focus:border-[#234d69]"
          placeholder={t("authChoosePasswordPlaceholder")}
        />
      </div>
      <button className="w-full rounded-xl bg-[#0d3350] py-2 text-sm tracking-wide text-[var(--color-beige)] transition hover:bg-[#123f61] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/60">
        {t("authCreateAccount")}
      </button>
    </form>
  );
}
