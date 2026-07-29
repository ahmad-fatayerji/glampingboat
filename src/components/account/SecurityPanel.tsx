"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const searchParams = useSearchParams();
  const initialError = searchParams.get("error");
  const [security, setSecurity] = useState<SecurityState | null>(null);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(
    initialError === "GoogleEmailMismatch"
      ? "Choose the Google account that matches your verified account email."
      : initialError === "GoogleAlreadyLinked"
        ? "That Google identity is already linked to another account."
        : ""
  );
  const [working, setWorking] = useState(false);

  const load = async () => {
    const response = await fetch("/api/account/security");
    if (response.ok) {
      setSecurity(await response.json());
    }
  };

  useEffect(() => {
    let active = true;

    fetch("/api/account/security")
      .then(async (response) => {
        if (response.ok && active) {
          setSecurity(await response.json());
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load security settings");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const updateMfa = async (enabled: boolean) => {
    setWorking(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/account/security", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled, password }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error ?? "Unable to update security settings");
    } else {
      setMessage(`Email sign-in codes were ${enabled ? "enabled" : "disabled"}.`);
      setPassword("");
      await load();
    }
    setWorking(false);
  };

  const unlinkGoogle = async () => {
    setWorking(true);
    setError("");
    const response = await fetch("/api/account/security", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error ?? "Unable to unlink Google");
    } else {
      setMessage("Google was unlinked from your account.");
      setPassword("");
      await load();
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
      setError(result.error ?? "Unable to start Google linking");
      setWorking(false);
      return;
    }
    await signIn("google", { callbackUrl: "/account?tab=security" });
  };

  if (!security) {
    return (
      <div className="border border-white/15 bg-[#3f5666]/82 p-8 text-[var(--color-beige)]">
        Loading security settings...
      </div>
    );
  }

  const emailMfaEnabled =
    security.mfaMode === "EMAIL" || security.emailMfaRequired;

  return (
    <section className="space-y-6 border border-white/15 bg-[#3f5666]/82 p-6 text-[var(--color-beige)] shadow-[0_18px_55px_rgba(0,0,0,0.35)] md:p-8">
      <div>
        <h2 className="text-xl">Account security</h2>
        <p className="mt-2 text-sm text-[var(--color-beige)]/75">
          Manage verified email, password sign-in codes, and your linked Google
          identity.
        </p>
      </div>

      {message && <p className="text-sm text-[#c7e8c7]">{message}</p>}
      {error && <p className="text-sm text-[#ffd9d9]">{error}</p>}

      <div className="space-y-2 border-t border-white/15 pt-5">
        <h3 className="font-medium">Email verification</h3>
        <p className="text-sm">
          {security.email} —{" "}
          <span className={security.emailVerified ? "text-[#c7e8c7]" : "text-[#ffd9d9]"}>
            {security.emailVerified ? "Verified" : "Not verified"}
          </span>
        </p>
      </div>

      <div className="space-y-3 border-t border-white/15 pt-5">
        <h3 className="font-medium">Email sign-in codes</h3>
        <p className="text-sm text-[var(--color-beige)]/75">
          Adds an 8-digit, single-use email code after your password. Google
          sign-in continues to use Google&apos;s own account security.
        </p>
        <p className="text-sm">
          Status: {emailMfaEnabled ? "Enabled" : "Disabled"}
          {security.emailMfaRequired ? " (required for administrators)" : ""}
        </p>
      </div>

      {security.hasPassword && (
        <label className="flex max-w-sm flex-col gap-1 text-sm">
          <span>Current password for security changes</span>
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
          {emailMfaEnabled ? "Disable email codes" : "Enable email codes"}
        </button>
      )}

      <div className="space-y-3 border-t border-white/15 pt-5">
        <h3 className="font-medium">Google sign-in</h3>
        <p className="text-sm text-[var(--color-beige)]/75">
          {security.googleLinked
            ? "Google is linked to this account."
            : "Google is not linked. A matching verified Google mailbox can be linked after your confirmation."}
        </p>
        {security.googleLinked ? (
          <button
            type="button"
            disabled={working || !security.hasPassword || !password}
            onClick={unlinkGoogle}
            className="rounded-xl border border-white/25 px-5 py-2 disabled:opacity-60"
          >
            Unlink Google
          </button>
        ) : googleAuthEnabled ? (
          <button
            type="button"
            disabled={working}
            onClick={linkGoogle}
            className="rounded-xl bg-[#0d3350] px-5 py-2"
          >
            Link Google account
          </button>
        ) : (
          <p className="text-sm text-[var(--color-beige)]/65">
            Google sign-in is not configured for this environment.
          </p>
        )}
      </div>
    </section>
  );
}
