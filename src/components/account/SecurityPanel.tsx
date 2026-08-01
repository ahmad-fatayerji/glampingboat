"use client";

import { signIn, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useLanguage } from "@/components/Language/LanguageContext";
import { useT, type TranslationKey } from "@/components/Language/useT";
import PasswordRequirements from "@/components/auth/PasswordRequirements";
import { validatePasswordPolicy } from "@/lib/password-policy";

type SecurityState = {
  email: string;
  emailVerified: boolean;
  mfaMode: "DISABLED" | "EMAIL";
  emailMfaRequired: boolean;
  googleLinked: boolean;
  hasPassword: boolean;
};

type SecurityErrorResponse = {
  code?: string;
  error?: string;
};

const securityErrorKeys: Record<string, TranslationKey> = {
  INVALID_SETTING: "securityInvalidSetting",
  EMAIL_VERIFICATION_REQUIRED: "securityVerifyEmailRequired",
  PASSWORD_SIGN_IN_ONLY: "securityCodesPasswordOnly",
  TOO_MANY_ATTEMPTS: "securityTooManyAttempts",
  CURRENT_PASSWORD_REQUIRED: "securityPasswordRequired",
  ADMIN_MFA_REQUIRED: "securityAdminRequiredError",
  PASSWORD_POLICY: "passwordPolicyError",
  PASSWORD_UNCHANGED: "securityPasswordUnchanged",
  PASSWORD_NOT_SET: "securityPasswordUnavailable",
  PASSWORD_ALREADY_SET: "securityPasswordAlreadySet",
  PASSWORD_SETUP_ERROR: "securityPasswordSetupError",
  PASSWORD_SETUP_RATE_LIMITED: "securityPasswordSetupRateLimited",
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
  const [message, setMessage] = useState("");
  const [error, setError] = useState(
    initialError === "GoogleEmailMismatch"
      ? t("securityGoogleMismatch")
      : initialError === "GoogleAlreadyLinked"
        ? t("securityGoogleAlreadyLinked")
        : ""
  );
  const [working, setWorking] = useState(false);
  const [mfaDialogEnabled, setMfaDialogEnabled] = useState<boolean | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const mfaTriggerRef = useRef<HTMLButtonElement>(null);
  const passwordTriggerRef = useRef<HTMLButtonElement>(null);

  const localizeError = useCallback(
    (result: SecurityErrorResponse, fallback: TranslationKey) =>
      result.code && securityErrorKeys[result.code]
        ? t(securityErrorKeys[result.code])
        : t(fallback),
    [t]
  );

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

  const updateMfa = async (enabled: boolean, password: string) => {
    setWorking(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/account/security", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, password, locale }),
      });
      const result = (await response.json().catch(() => ({}))) as SecurityErrorResponse;
      if (!response.ok) return localizeError(result, "securityUpdateError");

      await signOut({ callbackUrl: "/account?signedOut=1" });
      return null;
    } catch {
      return t("securityUpdateError");
    } finally {
      setWorking(false);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    setWorking(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/account/security", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, locale }),
      });
      const result = (await response.json().catch(() => ({}))) as SecurityErrorResponse;
      if (!response.ok) {
        return localizeError(result, "securityPasswordUpdateError");
      }

      await signOut({ callbackUrl: "/account?signedOut=1" });
      return null;
    } catch {
      return t("securityPasswordUpdateError");
    } finally {
      setWorking(false);
    }
  };

  const requestPasswordSetup = async () => {
    setWorking(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/account/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const result = (await response.json().catch(() => ({}))) as SecurityErrorResponse;
      if (!response.ok) {
        setError(localizeError(result, "securityPasswordSetupError"));
        return;
      }
      setMessage(t("securityPasswordSetupSent"));
    } catch {
      setError(t("securityPasswordSetupError"));
    } finally {
      setWorking(false);
    }
  };

  const linkGoogle = async () => {
    setWorking(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/link-google/start", {
        method: "POST",
      });
      if (!response.ok) {
        setError(t("securityGoogleStartError"));
        return;
      }
      await signIn("google", { callbackUrl: "/account?tab=security" });
    } catch {
      setError(t("securityGoogleStartError"));
    } finally {
      setWorking(false);
    }
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
    <>
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
            <span
              className={
                security.emailVerified ? "text-[#c7e8c7]" : "text-[#ffd9d9]"
              }
            >
              {security.emailVerified
                ? t("securityVerified")
                : t("securityNotVerified")}
            </span>
          </p>
        </div>

        <div className="space-y-3 border-t border-white/15 pt-5">
          <h3 className="font-medium">{t("securityPasswordTitle")}</h3>
          <p className="text-sm text-[var(--color-beige)]/75">
            {security.hasPassword
              ? t("securityPasswordDescription")
              : t("securityPasswordUnavailable")}
          </p>
          {security.hasPassword ? (
            <button
              ref={passwordTriggerRef}
              type="button"
              disabled={working}
              onClick={() => {
                setMessage("");
                setPasswordDialogOpen(true);
              }}
              className="rounded-xl bg-[#0d3350] px-5 py-2 disabled:opacity-60"
            >
              {t("securityChangePassword")}
            </button>
          ) : (
            <button
              type="button"
              disabled={working}
              onClick={requestPasswordSetup}
              className="rounded-xl bg-[#0d3350] px-5 py-2 disabled:opacity-60"
            >
              {t("securitySetPassword")}
            </button>
          )}
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
          {security.hasPassword && (
            <button
              ref={mfaTriggerRef}
              type="button"
              disabled={working || security.emailMfaRequired}
              onClick={() => {
                setMessage("");
                setMfaDialogEnabled(!emailMfaEnabled);
              }}
              className="rounded-xl bg-[#0d3350] px-5 py-2 disabled:opacity-60"
            >
              {emailMfaEnabled
                ? t("securityDisableCodes")
                : t("securityEnableCodes")}
            </button>
          )}
        </div>

        <div className="space-y-3 border-t border-white/15 pt-5">
          <h3 className="font-medium">{t("securityGoogleSignIn")}</h3>
          <p className="text-sm text-[var(--color-beige)]/75">
            {security.googleLinked
              ? t("securityGoogleLinkedPermanent")
              : t("securityGoogleNotLinked")}
          </p>
          {!security.googleLinked && googleAuthEnabled ? (
            <button
              type="button"
              disabled={working}
              onClick={linkGoogle}
              className="rounded-xl bg-[#0d3350] px-5 py-2"
            >
              {t("securityLinkGoogle")}
            </button>
          ) : !security.googleLinked ? (
            <p className="text-sm text-[var(--color-beige)]/65">
              {t("securityGoogleUnavailable")}
            </p>
          ) : null}
        </div>
      </section>

      <MfaPasswordDialog
        enabled={mfaDialogEnabled}
        busy={working}
        returnFocusRef={mfaTriggerRef}
        onClose={() => setMfaDialogEnabled(null)}
        onConfirm={updateMfa}
      />
      <ChangePasswordDialog
        open={passwordDialogOpen}
        busy={working}
        returnFocusRef={passwordTriggerRef}
        onClose={() => setPasswordDialogOpen(false)}
        onConfirm={changePassword}
      />
    </>
  );
}

function MfaPasswordDialog({
  enabled,
  busy,
  returnFocusRef,
  onClose,
  onConfirm,
}: {
  enabled: boolean | null;
  busy: boolean;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onConfirm: (enabled: boolean, password: string) => Promise<string | null>;
}) {
  const t = useT();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const close = () => {
    if (busy) return;
    setPassword("");
    setError("");
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (enabled === null || !password) return;
    const nextError = await onConfirm(enabled, password);
    if (nextError) setError(nextError);
  };

  return (
    <SecurityDialog
      open={enabled !== null}
      title={
        enabled
          ? t("securityEnableCodesDialogTitle")
          : t("securityDisableCodesDialogTitle")
      }
      busy={busy}
      returnFocusRef={returnFocusRef}
      onClose={close}
    >
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-[var(--color-beige)]/80">
          {t("securityConfirmPasswordDescription")}
        </p>
        <PasswordField
          autoFocus
          label={t("securityCurrentPassword")}
          value={password}
          onChange={setPassword}
        />
        {error && <DialogError>{error}</DialogError>}
        <DialogActions busy={busy} submitDisabled={!password} onClose={close}>
          {enabled ? t("securityEnableCodes") : t("securityDisableCodes")}
        </DialogActions>
      </form>
    </SecurityDialog>
  );
}

function ChangePasswordDialog({
  open,
  busy,
  returnFocusRef,
  onClose,
  onConfirm,
}: {
  open: boolean;
  busy: boolean;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onConfirm: (currentPassword: string, newPassword: string) => Promise<string | null>;
}) {
  const t = useT();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const policy = validatePasswordPolicy(newPassword);

  const close = () => {
    if (busy) return;
    setCurrentPassword("");
    setNewPassword("");
    setConfirmation("");
    setError("");
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!policy.valid) {
      setError(t("passwordPolicyError"));
      return;
    }
    if (newPassword !== confirmation) {
      setError(t("passwordMismatch"));
      return;
    }
    const nextError = await onConfirm(currentPassword, newPassword);
    if (nextError) setError(nextError);
  };

  return (
    <SecurityDialog
      open={open}
      title={t("securityChangePasswordDialogTitle")}
      busy={busy}
      returnFocusRef={returnFocusRef}
      onClose={close}
    >
      <form onSubmit={submit} className="space-y-4">
        <PasswordField
          autoFocus
          label={t("securityCurrentPassword")}
          value={currentPassword}
          onChange={setCurrentPassword}
        />
        <PasswordField
          label={t("newPassword")}
          value={newPassword}
          onChange={setNewPassword}
        />
        <PasswordField
          label={t("confirmPassword")}
          value={confirmation}
          onChange={setConfirmation}
        />
        <PasswordRequirements password={newPassword} tone="dark" />
        {error && <DialogError>{error}</DialogError>}
        <DialogActions
          busy={busy}
          submitDisabled={!currentPassword || !policy.valid || newPassword !== confirmation}
          onClose={close}
        >
          {t("securitySavePassword")}
        </DialogActions>
      </form>
    </SecurityDialog>
  );
}

function SecurityDialog({
  open,
  title,
  busy,
  returnFocusRef,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  busy: boolean;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    if (!open) return;
    const returnFocusTo = returnFocusRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      returnFocusTo?.focus();
    };
  }, [open, returnFocusRef]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busyRef.current) {
          onCloseRef.current();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md border border-white/15 bg-[#3f5666] p-6 text-[var(--color-beige)] shadow-[0_18px_55px_rgba(0,0,0,0.55)] md:p-7"
      >
        <h2 id={titleId} className="mb-5 border-b border-white/15 pb-3 text-lg">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoFocus = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <input
        autoFocus={autoFocus}
        type="password"
        autoComplete={autoFocus ? "current-password" : "new-password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] px-3 text-[var(--color-blue)] outline-none focus:border-[#234d69]"
      />
    </label>
  );
}

function DialogError({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-[#8a3a30] bg-[#8a3a30]/25 px-3 py-2 text-sm text-[#ffd9d9]">
      {children}
    </p>
  );
}

function DialogActions({
  busy,
  submitDisabled,
  onClose,
  children,
}: {
  busy: boolean;
  submitDisabled: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const t = useT();
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button
        type="button"
        disabled={busy}
        onClick={onClose}
        className="rounded-xl border border-white/25 px-4 py-2 disabled:opacity-60"
      >
        {t("cancel")}
      </button>
      <button
        type="submit"
        disabled={busy || submitDisabled}
        className="rounded-xl bg-[#0d3350] px-5 py-2 disabled:opacity-60"
      >
        {busy ? t("saving") : children}
      </button>
    </div>
  );
}
