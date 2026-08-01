import bcrypt from "bcryptjs";
import type { Prisma } from "@/generated/prisma/client";
import { getRequestSecurityContext } from "@/lib/auth-security";
import { validatePasswordPolicy } from "@/lib/password-policy";
import { prisma } from "@/lib/prisma";

const SECURITY_PASSWORD_FAILURE_LIMIT = 8;
const SECURITY_PASSWORD_WINDOW_MS = 15 * 60 * 1000;

export type AccountSecurityPasswordUser = {
  id: string;
  password: string | null;
};

export type AccountSecurityPasswordClient = {
  authEvent: {
    findFirst(
      args: Prisma.AuthEventFindFirstArgs
    ): Promise<{ createdAt: Date } | null>;
    count(args: Prisma.AuthEventCountArgs): Promise<number>;
    create(args: Prisma.AuthEventCreateArgs): Promise<unknown>;
  };
  user: {
    update(args: Prisma.UserUpdateArgs): Promise<unknown>;
  };
};

export type SecurityPasswordVerification =
  | "VERIFIED"
  | "INVALID"
  | "LIMITED";

export type AccountPasswordChangeResult =
  | "UPDATED"
  | "PASSWORD_NOT_SET"
  | "PASSWORD_POLICY"
  | "PASSWORD_UNCHANGED"
  | "CURRENT_PASSWORD_REQUIRED"
  | "TOO_MANY_ATTEMPTS";

const defaultClient = prisma as unknown as AccountSecurityPasswordClient;

export async function verifyAccountSecurityPassword(
  {
    user,
    password,
    request,
  }: {
    user: AccountSecurityPasswordUser;
    password: string | undefined;
    request: Request;
  },
  client: AccountSecurityPasswordClient = defaultClient
): Promise<SecurityPasswordVerification> {
  const windowStart = new Date(Date.now() - SECURITY_PASSWORD_WINDOW_MS);
  const lastSuccess = await client.authEvent.findFirst({
    where: {
      userId: user.id,
      type: "SIGN_IN",
      provider: "account-security",
      createdAt: { gte: windowStart },
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  const failures = await client.authEvent.count({
    where: {
      userId: user.id,
      type: "SIGN_IN_FAILED",
      provider: "account-security",
      createdAt: { gte: lastSuccess?.createdAt ?? windowStart },
    },
  });
  if (failures >= SECURITY_PASSWORD_FAILURE_LIMIT) return "LIMITED";

  const matches = Boolean(
    password && user.password && (await bcrypt.compare(password, user.password))
  );
  const context = getRequestSecurityContext(request);
  await client.authEvent.create({
    data: {
      userId: user.id,
      type: matches ? "SIGN_IN" : "SIGN_IN_FAILED",
      provider: "account-security",
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    },
  });
  return matches ? "VERIFIED" : "INVALID";
}

export async function changeAccountPassword(
  {
    user,
    currentPassword,
    newPassword,
    request,
  }: {
    user: AccountSecurityPasswordUser;
    currentPassword: string | undefined;
    newPassword: string | undefined;
    request: Request;
  },
  client: AccountSecurityPasswordClient = defaultClient
): Promise<AccountPasswordChangeResult> {
  if (!user.password) return "PASSWORD_NOT_SET";
  if (!newPassword || !validatePasswordPolicy(newPassword).valid) {
    return "PASSWORD_POLICY";
  }

  const verification = await verifyAccountSecurityPassword(
    { user, password: currentPassword, request },
    client
  );
  if (verification === "LIMITED") return "TOO_MANY_ATTEMPTS";
  if (verification === "INVALID") return "CURRENT_PASSWORD_REQUIRED";
  if (await bcrypt.compare(newPassword, user.password)) {
    return "PASSWORD_UNCHANGED";
  }

  await client.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(newPassword, 12),
      sessionVersion: { increment: 1 },
    },
  });
  const context = getRequestSecurityContext(request);
  await client.authEvent.create({
    data: {
      userId: user.id,
      type: "PASSWORD_RESET",
      provider: "account-security-change",
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: { action: "password-change" },
    },
  });

  return "UPDATED";
}
