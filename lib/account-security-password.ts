import bcrypt from "bcryptjs";
import type { Prisma } from "@/generated/prisma/client";
import { recordAuthEvent } from "@/lib/auth-security";
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
  };
  user: {
    update(args: Prisma.UserUpdateArgs): Promise<unknown>;
  };
};

export type AccountSecurityEventRecorder = (
  event: Parameters<typeof recordAuthEvent>[0]
) => Promise<unknown>;

export type AccountSecurityPasswordDependencies = {
  client: AccountSecurityPasswordClient;
  recordEvent: AccountSecurityEventRecorder;
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

const defaultClient: AccountSecurityPasswordClient = prisma;
const defaultDependencies: AccountSecurityPasswordDependencies = {
  client: defaultClient,
  recordEvent: recordAuthEvent,
};

async function isAccountSecurityPasswordLimited(
  userId: string,
  client: AccountSecurityPasswordClient
) {
  const windowStart = new Date(Date.now() - SECURITY_PASSWORD_WINDOW_MS);
  const lastSuccess = await client.authEvent.findFirst({
    where: {
      userId,
      type: "SIGN_IN",
      provider: "account-security",
      createdAt: { gte: windowStart },
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  const failures = await client.authEvent.count({
    where: {
      userId,
      type: "SIGN_IN_FAILED",
      provider: "account-security",
      createdAt: { gte: lastSuccess?.createdAt ?? windowStart },
    },
  });
  return failures >= SECURITY_PASSWORD_FAILURE_LIMIT;
}

export async function verifyAccountSecurityPassword(
  {
    user,
    password,
    request,
    rateLimitChecked = false,
  }: {
    user: AccountSecurityPasswordUser;
    password: string | undefined;
    request: Request;
    rateLimitChecked?: boolean;
  },
  dependencies: AccountSecurityPasswordDependencies = defaultDependencies
): Promise<SecurityPasswordVerification> {
  if (
    !rateLimitChecked &&
    (await isAccountSecurityPasswordLimited(user.id, dependencies.client))
  ) {
    return "LIMITED";
  }

  const matches = Boolean(
    password && user.password && (await bcrypt.compare(password, user.password))
  );
  await dependencies.recordEvent({
    userId: user.id,
    type: matches ? "SIGN_IN" : "SIGN_IN_FAILED",
    provider: "account-security",
    request,
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
  dependencies: AccountSecurityPasswordDependencies = defaultDependencies
): Promise<AccountPasswordChangeResult> {
  if (!user.password) return "PASSWORD_NOT_SET";
  if (await isAccountSecurityPasswordLimited(user.id, dependencies.client)) {
    return "TOO_MANY_ATTEMPTS";
  }
  if (!newPassword || !validatePasswordPolicy(newPassword).valid) {
    return "PASSWORD_POLICY";
  }

  const verification = await verifyAccountSecurityPassword(
    { user, password: currentPassword, request, rateLimitChecked: true },
    dependencies
  );
  if (verification === "INVALID") return "CURRENT_PASSWORD_REQUIRED";
  if (await bcrypt.compare(newPassword, user.password)) {
    return "PASSWORD_UNCHANGED";
  }

  await dependencies.client.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(newPassword, 12),
      sessionVersion: { increment: 1 },
    },
  });
  await dependencies.recordEvent({
    userId: user.id,
    type: "PASSWORD_RESET",
    provider: "account-security-change",
    request,
    metadata: { action: "password-change" },
  });

  return "UPDATED";
}
