"use client";

import type { UserRole } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/components/Language/LanguageContext";
import { roleLabel } from "./admin-i18n";
import { useAdminT } from "./useAdminT";

const ELEVATED_ROLE_CONFIRMATION = "CONFIRMER";

export default function AdminRoleSelect({
  userId,
  value,
  disabled = false,
}: {
  userId: string;
  value: UserRole;
  disabled?: boolean;
}) {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = useAdminT();
  const [editing, setEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(value);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRoleIsElevated = selectedRole === "ADMIN";

  async function updateRole(role: UserRole, confirmedByUser = "") {
    if (role === value) {
      setEditing(false);
      setPendingRole(null);
      return;
    }

    if (
      role === "ADMIN" &&
      confirmedByUser !== ELEVATED_ROLE_CONFIRMATION
    ) {
      setError(t("typeConfirm", { code: ELEVATED_ROLE_CONFIRMATION }));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          confirmation: role === "ADMIN" ? confirmedByUser : undefined,
        }),
      });
      const json = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || t("roleChangeFailed"));
      }

      setEditing(false);
      setPendingRole(null);
      setConfirmation("");
      router.refresh();
    } catch (roleError) {
      setError(roleError instanceof Error ? roleError.message : t("error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-1">
      {editing ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <select
            value={selectedRole}
            disabled={disabled || saving}
            onChange={(event) => {
              setSelectedRole(event.target.value as UserRole);
              setError(null);
            }}
            className="admin-input h-9 rounded-md px-2 text-sm disabled:opacity-55"
          >
            <option value="CUSTOMER">{roleLabel(locale, "CUSTOMER")}</option>
            <option value="ADMIN">{roleLabel(locale, "ADMIN")}</option>
          </select>
          <button
            type="button"
            disabled={disabled || saving}
            onClick={() => {
              if (selectedRoleIsElevated && selectedRole !== value) {
                setPendingRole(selectedRole);
                setConfirmation("");
                setError(null);
                return;
              }

              updateRole(selectedRole);
            }}
            className="admin-button h-9 rounded-md px-3 text-xs font-medium disabled:opacity-55"
          >
            {t("apply")}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              setSelectedRole(value);
              setEditing(false);
              setPendingRole(null);
              setConfirmation("");
              setError(null);
            }}
            className="admin-button-secondary h-9 px-3 text-xs disabled:opacity-55"
          >
            {t("cancel")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || saving}
          onClick={() => {
            setSelectedRole(value);
            setEditing(true);
            setPendingRole(null);
            setConfirmation("");
            setError(null);
          }}
          className="admin-button-secondary h-9 px-3 text-sm disabled:opacity-55"
        >
          {roleLabel(locale, value)}
        </button>
      )}
      {error && (
        <p role="alert" className="max-w-56 text-xs text-[#ffd8d2]">
          {error}
        </p>
      )}
      {pendingRole && (
        <div
          className="fixed right-4 top-4 z-[220] w-[min(92vw,380px)] rounded-md border border-[#8aa7b8]/35 bg-[#183d57] p-4 text-left text-[var(--color-beige)] shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
          role="dialog"
          aria-modal="false"
          aria-labelledby={`role-confirmation-${userId}`}
        >
          <p
            id={`role-confirmation-${userId}`}
            className="text-sm font-semibold"
          >
            {t("confirmRoleChange")}
          </p>
          <p className="admin-muted mt-2 text-xs">
            {t("typeConfirmRole", {
              role: roleLabel(locale, pendingRole),
              code: ELEVATED_ROLE_CONFIRMATION,
            })}
          </p>
          <input
            value={confirmation}
            disabled={saving}
            onChange={(event) => {
              setConfirmation(event.target.value);
              setError(null);
            }}
            className="admin-input mt-3 h-10 w-full rounded-md px-3 text-sm disabled:opacity-55"
            autoFocus
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setPendingRole(null);
                setConfirmation("");
                setError(null);
              }}
              className="admin-button-secondary h-9 px-3 text-xs disabled:opacity-55"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              disabled={saving || confirmation !== ELEVATED_ROLE_CONFIRMATION}
              onClick={() => updateRole(pendingRole, confirmation)}
              className="admin-button h-9 rounded-md px-3 text-xs font-medium disabled:opacity-55"
            >
              {t("confirm")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
