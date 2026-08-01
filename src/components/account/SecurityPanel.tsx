"use client";

import { signIn, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/components/Language/LanguageContext";
import { useT } from "@/components/Language/useT";

type SecurityState = {
  email: string;
  emailVerified: boolean;
  mfaMode: "DISABLED" | "EMAIL";
  emailMfaRequired: boolean;
  googleLinked: boolean;
  hasPassword: boolean;
};

export default function SecurityPanel({
  googleAuthEnabled,
}: {
  googleAuthEnabled: boolean;
}) {
  const t = useT();
  const { locale } = useLanguage();
  const searchParams = useSearchParams();
  const initialError = searchParams.get("error");
  const [security, setSecurity] = useState<SecurityState | null>(null);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(
    initialError === "GoogleEmailMismatch"
      ? t("securityGoogleMismatch")
      : initialError === "GoogleAlreadyLinked"
        ? t("securityGoogleAlreadyLinked")
        : ""
  );
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/account/security");
      if (!response.ok) throw new Error();
      setSecurity(await response.json());
    } catch {
      setError(t("securityLoadError"));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateMfa = async (enabled: boolean) => {
    setWorking(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/account/security", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled, password, locale }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error ?? t("securityUpdateError"));
    } else {
      await signOut({ callbackUrl: "/account?signedOut=1" });
    }
    setWorking(false);
  };

  const unlinkGoogle = async () => {
    setWorking(true);
    setError("");
    const response = await fetch("/api/account/security", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, locale }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error ?? t("securityUnlinkError"));
    } else {
      await signOut({ callbackUrl: "/account?signedOut=1" });
    }
    setWorking(false);
  };

  const linkGoogle = async () => {
    setWorking(true);
    setError("");
    const response = await fetch("/api/auth/link-google/start", {
      method: "POST",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error ?? t("securityGoogleStartError"));
      setWorking(false);
      return;
    }
    await signIn("google", { callbackUrl: "/account?tab=security" });
  };

  if (!security) {
    return (
      <div className="border border-white/15 bg-[#3f5666]/82 p-8 text-[var(--color-beige)]">
        {t("securityLoading")}
      </div>
    );
  }

  const emailMfaEnabled =
    security.mfaMode === "EMAIL" || security.emailMfaRequired;

  return (
    <section className="space-y-6 border border-white/15 bg-[#3f5666]/82 p-6 text-[var(--color-beige)] shadow-[0_18px_55px_rgba(0,0,0,0.35)] md:p-8">
      <div>
        <h2 className="text-xl">{t("securityTitle")}</h2>
        <p className="mt-2 text-sm text-[var(--color-beige)]/75">
          {t("securityDescription")}
        </p>
      </div>

      {message && <p className="text-sm text-[#c7e8c7]">{message}</p>}
      {error && <p className="text-sm text-[#ffd9d9]">{error}</p>}

      <div className="space-y-2 border-t border-white/15 pt-5">
        <h3 className="font-medium">{t("securityEmailVerification")}</h3>
        <p className="text-sm">
          {security.email} —{" "}
          <span className={security.emailVerified ? "text-[#c7e8c7]" : "text-[#ffd9d9]"}>
            {security.emailVerified ? t("securityVerified") : t("securityNotVerified")}
          </span>
        </p>
      </div>

      <div className="space-y-3 border-t border-white/15 pt-5">
        <h3 className="font-medium">{t("securityEmailCodes")}</h3>
        <p className="text-sm text-[var(--color-beige)]/75">
          {t("securityEmailCodesDescription")}
        </p>
        <p className="text-sm">
          {t("securityStatus")}: {emailMfaEnabled ? t("securityEnabled") : t("securityDisabled")}
          {security.emailMfaRequired ? ` ${t("securityAdminRequired")}` : ""}
        </p>
      </div>

      {security.hasPassword && (
        <label className="flex max-w-sm flex-col gap-1 text-sm">
          <span>{t("securityCurrentPassword")}</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-10 rounded-md bg-[var(--color-beige)] px-3 text-[var(--color-blue)]"
          />
        </label>
      )}

      {security.hasPassword && (
        <button
          type="button"
          disabled={working || !password || security.emailMfaRequired}
          onClick={() => updateMfa(!emailMfaEnabled)}
          className="rounded-xl bg-[#0d3350] px-5 py-2 disabled:opacity-60"
        >
          {emailMfaEnabled ? t("securityDisableCodes") : t("securityEnableCodes")}
        </button>
      )}

      <div className="space-y-3 border-t border-white/15 pt-5">
        <h3 className="font-medium">{t("securityGoogleSignIn")}</h3>
        <p className="text-sm text-[var(--color-beige)]/75">
          {security.googleLinked
            ? t("securityGoogleLinked")
            : t("securityGoogleNotLinked")}
        </p>
        {security.googleLinked ? (
          <button
            type="button"
            disabled={working || !security.hasPassword || !password}
            onClick={unlinkGoogle}
            className="rounded-xl border border-white/25 px-5 py-2 disabled:opacity-60"
          >
            {t("securityUnlinkGoogle")}
          </button>
        ) : googleAuthEnabled ? (
          <button
            type="button"
            disabled={working}
            onClick={linkGoogle}
            className="rounded-xl bg-[#0d3350] px-5 py-2"
          >
            {t("securityLinkGoogle")}
          </button>
        ) : (
          <p className="text-sm text-[var(--color-beige)]/65">
            {t("securityGoogleUnavailable")}
          </p>
        )}
      </div>
    </section>
  );
}
