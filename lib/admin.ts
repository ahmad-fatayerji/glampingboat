import { auth } from "@auth";
import type { Session } from "next-auth";
import { isAdminRole, isSuperAdminRole } from "@/lib/admin-roles";

export class AdminAccessError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403
  ) {
    super(message);
  }
}

export async function requireAdmin(): Promise<Session> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new AdminAccessError("Unauthorized", 401);
  }

  if (!isAdminRole(session.user.role)) {
    throw new AdminAccessError("Forbidden", 403);
  }

  return session;
}

export async function requireSuperAdmin(): Promise<Session> {
  const session = await requireAdmin();

  if (!isSuperAdminRole(session.user.role)) {
    throw new AdminAccessError("Forbidden", 403);
  }

  return session;
}
