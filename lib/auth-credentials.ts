import type { MfaMode, UserRole } from "@/generated/prisma/client";
import bcrypt from "bcryptjs";
import { verifyCodeChallenge } from "@/lib/auth-security";
import { normalizeEmailAddress } from "@/lib/email-identity";

export const AUTH_ERROR_EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED";
export const AUTH_ERROR_MFA_REQUIRED = "EMAIL_CODE_REQUIRED";
export const AUTH_ERROR_INVALID = "Invalid email or password";
const DUMMY_PASSWORD_HASH =
  "$2b$12$6mBm7esnMdN0i2CrMoc3VuRhlylx.PEJyB8PiM.HnHvis6TrD1pTO";

export type CredentialsInput = Partial<
  Record<"email" | "password" | "challengeToken" | "code", unknown>
>;

export type CredentialsUserRecord = {
  id: string;
  email: string;
  canonicalEmail: string | null;
  emailVerifiedAt: Date | null;
  name: string | null;
  password: string | null;
  role: UserRole;
  mfaMode: MfaMode;
  sessionVersion: number;
};

export type CredentialsAuthClient = {
  user: {
    findFirst(args: {
      where: {
        OR: Array<
          { email: string } | { canonicalEmail: string }
        >;
      };
    }): Promise<CredentialsUserRecord | null>;
    update(args: {
      where: { id: string };
      data: { role: UserRole };
      select: { role: true };
    }): Promise<{ role: UserRole }>;
  };
};

export function requiresEmailMfa(user: {
  role: UserRole;
  mfaMode: MfaMode;
}) {
  return user.mfaMode === "EMAIL" || user.role !== "CUSTOMER";
}

export async function findCredentialsUser(
  rawEmail: string,
  client: CredentialsAuthClient
) {
  const normalized = normalizeEmailAddress(rawEmail);
  if (!normalized) {
    return null;
  }

  return client.user.findFirst({
    where: {
      OR: [
        { email: normalized.email },
        { canonicalEmail: normalized.canonicalEmail },
      ],
    },
  });
}

export async function verifyCredentialsPassword(
  rawEmail: string,
  password: string,
  client: CredentialsAuthClient
) {
  const user = await findCredentialsUser(rawEmail, client);
  const passwordMatches = await bcrypt.compare(
    password,
    user?.password ?? DUMMY_PASSWORD_HASH
  );
  if (!user?.password || !passwordMatches) {
    return null;
  }

  return user;
}

export async function authorizeCredentials(
  creds: CredentialsInput | undefined,
  client: CredentialsAuthClient,
  getInitialRoleForEmail: (email: string) => UserRole,
  verifyMfa = verifyCodeChallenge
) {
  if (
    !creds ||
    typeof creds.email !== "string" ||
    typeof creds.password !== "string"
  ) {
    throw new Error(AUTH_ERROR_INVALID);
  }

  const user = await verifyCredentialsPassword(
    creds.email,
    creds.password,
    client
  );
  if (!user) {
    throw new Error(AUTH_ERROR_INVALID);
  }

  const initialRole = getInitialRoleForEmail(user.email);
  const role =
    initialRole === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN"
      ? "SUPER_ADMIN"
      : user.role;

  if (!user.emailVerifiedAt) {
    throw new Error(AUTH_ERROR_EMAIL_NOT_VERIFIED);
  }

  if (requiresEmailMfa({ ...user, role })) {
    const challengeToken =
      typeof creds.challengeToken === "string" ? creds.challengeToken : "";
    const code = typeof creds.code === "string" ? creds.code : "";
    const challenge = await verifyMfa({
      token: challengeToken,
      code,
      purpose: "LOGIN_EMAIL_OTP",
    });

    if (!challenge || challenge.userId !== user.id) {
      throw new Error(AUTH_ERROR_MFA_REQUIRED);
    }
  }

  if (role !== user.role) {
    await client.user.update({
      where: { id: user.id },
      data: { role },
      select: { role: true },
    });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? undefined,
    role,
    sessionVersion: user.sessionVersion,
  };
}
