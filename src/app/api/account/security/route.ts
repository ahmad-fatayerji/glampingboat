import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { auth } from "@auth";
import { recordAuthEvent } from "@/lib/auth-security";
import { sendSecuritySettingEmail } from "@/lib/auth-emails";
import { prisma } from "@/lib/prisma";
import { getBoolean, getString, isRecord } from "@/lib/type-guards";
import { normalizeEmailLocale } from "@/lib/email-i18n";
import {
  PASSWORD_POLICY_ERROR,
  validatePasswordPolicy,
} from "@/lib/password-policy";

async function currentSecurityUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: { authIdentities: true },
  });
}

const SECURITY_PASSWORD_FAILURE_LIMIT = 8;
const SECURITY_PASSWORD_WINDOW_MS = 15 * 60 * 1000;

async function verifySecurityPassword(
  user: NonNullable<Awaited<ReturnType<typeof currentSecurityUser>>>,
  password: string | undefined,
  req: Request
) {
  const windowStart = new Date(Date.now() - SECURITY_PASSWORD_WINDOW_MS);
  const lastSuccess = await prisma.authEvent.findFirst({
    where: {
      userId: user.id,
      type: "SIGN_IN",
      provider: "account-security",
      createdAt: { gte: windowStart },
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  const failures = await prisma.authEvent.count({
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
  await recordAuthEvent({
    userId: user.id,
    type: matches ? "SIGN_IN" : "SIGN_IN_FAILED",
    provider: "account-security",
    request: req,
  });
  return matches ? "VERIFIED" : "INVALID";
}

export async function GET() {
  const user = await currentSecurityUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    email: user.email,
    emailVerified: Boolean(user.emailVerifiedAt),
    mfaMode: user.mfaMode,
    emailMfaRequired: user.role !== "CUSTOMER",
    googleLinked: user.authIdentities.some(
      (identity) => identity.provider === "google"
    ),
    hasPassword: Boolean(user.password),
  });
}

export async function PUT(req: Request) {
  const user = await currentSecurityUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const enabled = isRecord(body) ? getBoolean(body, "enabled") : undefined;
  const password = isRecord(body) ? getString(body, "password") : undefined;
  const locale = normalizeEmailLocale(
    isRecord(body) ? getString(body, "locale") : undefined
  );
  if (enabled === undefined) {
    return NextResponse.json(
      { code: "INVALID_SETTING", error: "Invalid setting" },
      { status: 400 }
    );
  }
  if (!user.emailVerifiedAt) {
    return NextResponse.json(
      {
        code: "EMAIL_VERIFICATION_REQUIRED",
        error: "Verify your email before changing security settings",
      },
      { status: 403 }
    );
  }
  if (!user.password) {
    return NextResponse.json(
      {
        code: "PASSWORD_SIGN_IN_ONLY",
        error: "Email sign-in codes apply to password sign-ins only",
      },
      { status: 409 }
    );
  }
  const passwordResult = await verifySecurityPassword(user, password, req);
  if (passwordResult === "LIMITED") {
    return NextResponse.json(
      {
        code: "TOO_MANY_ATTEMPTS",
        error: "Too many password attempts. Try again later.",
      },
      { status: 429 }
    );
  }
  if (passwordResult === "INVALID") {
    return NextResponse.json(
      {
        code: "CURRENT_PASSWORD_REQUIRED",
        error: "Your current password is required",
      },
      { status: 401 }
    );
  }
  if (!enabled && user.role !== "CUSTOMER") {
    return NextResponse.json(
      {
        code: "ADMIN_MFA_REQUIRED",
        error: "Email sign-in codes are required for administrator accounts",
      },
      { status: 403 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      mfaMode: enabled ? "EMAIL" : "DISABLED",
      sessionVersion: { increment: 1 },
    },
  });
  await recordAuthEvent({
    userId: user.id,
    type: enabled ? "MFA_ENABLED" : "MFA_DISABLED",
    provider: "email",
    request: req,
  });
  await sendSecuritySettingEmail(user.email, enabled, locale).catch((error) =>
    console.error("Failed to send security-setting email", error)
  );

  return NextResponse.json({ ok: true, mfaMode: enabled ? "EMAIL" : "DISABLED" });
}

export async function PATCH(req: Request) {
  const user = await currentSecurityUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user.password) {
    return NextResponse.json(
      {
        code: "PASSWORD_NOT_SET",
        error: "This account does not have a password",
      },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => null);
  const currentPassword = isRecord(body)
    ? getString(body, "currentPassword")
    : undefined;
  const newPassword = isRecord(body)
    ? getString(body, "newPassword")
    : undefined;
  if (!newPassword || !validatePasswordPolicy(newPassword).valid) {
    return NextResponse.json(
      { code: "PASSWORD_POLICY", error: PASSWORD_POLICY_ERROR },
      { status: 400 }
    );
  }

  const passwordResult = await verifySecurityPassword(
    user,
    currentPassword,
    req
  );
  if (passwordResult === "LIMITED") {
    return NextResponse.json(
      {
        code: "TOO_MANY_ATTEMPTS",
        error: "Too many password attempts. Try again later.",
      },
      { status: 429 }
    );
  }
  if (passwordResult === "INVALID") {
    return NextResponse.json(
      {
        code: "CURRENT_PASSWORD_REQUIRED",
        error: "Your current password is required",
      },
      { status: 401 }
    );
  }

  if (await bcrypt.compare(newPassword, user.password)) {
    return NextResponse.json(
      {
        code: "PASSWORD_UNCHANGED",
        error: "Choose a password different from your current password",
      },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(newPassword, 12),
      sessionVersion: { increment: 1 },
    },
  });
  await recordAuthEvent({
    userId: user.id,
    type: "PASSWORD_RESET",
    provider: "account-security-change",
    request: req,
    metadata: { action: "password-change" },
  });

  return NextResponse.json({ ok: true });
}
