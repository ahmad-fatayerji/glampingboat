import type { UserRole } from "@/generated/prisma/client";

export function getSuperAdminEmails() {
  return (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isSuperAdminEmail(email: string | null | undefined) {
  return email ? getSuperAdminEmails().includes(email.toLowerCase()) : false;
}

export function getEffectiveRoleForEmail(
  email: string | null | undefined,
  dbRole: UserRole | null | undefined
): UserRole {
  if (isSuperAdminEmail(email)) {
    return "SUPER_ADMIN";
  }

  return dbRole === "SUPER_ADMIN" ? "ADMIN" : dbRole ?? "CUSTOMER";
}
