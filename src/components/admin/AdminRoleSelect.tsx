"use client";

import type { UserRole } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ELEVATED_ROLE_CONFIRMATION = "CONFIRMER";

const ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: "Client",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super admin",
};

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
  const [editing, setEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateRole(role: UserRole) {
    if (role === value) {
      setEditing(false);
      return;
    }

    const confirmation =
      role === "ADMIN" || role === "SUPER_ADMIN"
        ? window.prompt(
            `Pour attribuer le role ${ROLE_LABELS[role]}, tapez ${ELEVATED_ROLE_CONFIRMATION}.`
          )
        : null;

    if (
      (role === "ADMIN" || role === "SUPER_ADMIN") &&
      confirmation !== ELEVATED_ROLE_CONFIRMATION
    ) {
      setError("Changement annule.");
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
          confirmation:
            role === "ADMIN" || role === "SUPER_ADMIN"
              ? ELEVATED_ROLE_CONFIRMATION
              : undefined,
        }),
      });
      const json = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || "Role impossible a modifier");
      }

      setEditing(false);
      router.refresh();
    } catch (roleError) {
      setError(roleError instanceof Error ? roleError.message : "Erreur");
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
            onChange={(event) => setSelectedRole(event.target.value as UserRole)}
            className="admin-input h-9 rounded-md px-2 text-sm disabled:opacity-55"
          >
            <option value="CUSTOMER">Client</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super admin</option>
          </select>
          <button
            type="button"
            disabled={disabled || saving}
            onClick={() => updateRole(selectedRole)}
            className="admin-button h-9 rounded-md px-3 text-xs font-medium disabled:opacity-55"
          >
            Appliquer
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              setSelectedRole(value);
              setEditing(false);
              setError(null);
            }}
            className="admin-input h-9 rounded-md px-3 text-xs disabled:opacity-55"
          >
            Annuler
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || saving}
          onClick={() => {
            setSelectedRole(value);
            setEditing(true);
            setError(null);
          }}
          className="admin-input h-9 rounded-md px-3 text-sm disabled:opacity-55"
        >
          {ROLE_LABELS[value]}
        </button>
      )}
      {error && <p className="max-w-56 text-xs text-[#ffd8d2]">{error}</p>}
    </div>
  );
}
