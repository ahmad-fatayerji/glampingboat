"use client";

import type { UserRole } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateRole(role: UserRole) {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const json = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || "Role impossible a modifier");
      }

      router.refresh();
    } catch (roleError) {
      setError(roleError instanceof Error ? roleError.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-1">
      <select
        defaultValue={value}
        disabled={disabled || saving}
        onChange={(event) => updateRole(event.target.value as UserRole)}
        className="h-9 rounded-md border border-[#cdbda8] bg-[#fbf8f3] px-2 text-sm disabled:opacity-55"
      >
        <option value="CUSTOMER">Client</option>
        <option value="ADMIN">Admin</option>
        <option value="SUPER_ADMIN">Super admin</option>
      </select>
      {error && <p className="max-w-56 text-xs text-[#8f3128]">{error}</p>}
    </div>
  );
}
