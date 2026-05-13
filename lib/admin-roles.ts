import type { UserRole } from "@/generated/prisma/client";

export const ADMIN_ROLES: readonly UserRole[] = ["ADMIN", "SUPER_ADMIN"];

export function isAdminRole(role: UserRole | undefined | null) {
  return role ? ADMIN_ROLES.includes(role) : false;
}

export function isSuperAdminRole(role: UserRole | undefined | null) {
  return role === "SUPER_ADMIN";
}
