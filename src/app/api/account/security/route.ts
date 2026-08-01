import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { auth } from "@auth";
import { recordAuthEvent } from "@/lib/auth-security";
import { sendSecuritySettingEmail } from "@/lib/auth-emails";
import { prisma } from "@/lib/prisma";
import { getBoolean, getString, isRecord } from "@/lib/type-guards";
import { normalizeEmailLocale } from "@/lib/email-i18n";

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
    return NextResponse.json({ error: "Invalid setting" }, { status: 400 });
  }
  if (!user.emailVerifiedAt) {
    return NextResponse.json(
      { error: "Verify your email before changing security settings" },
      { status: 403 }
    );
  }
  if (!user.password) {
    return NextResponse.json(
      { error: "Email sign-in codes apply to password sign-ins only" },
      { status: 409 }
    );
  }
  const passwordResult = await verifySecurityPassword(user, password, req);
  if (passwordResult === "LIMITED") {
    return NextResponse.json(
      { error: "Too many password attempts. Try again later." },
      { status: 429 }
    );
  }
  if (passwordResult === "INVALID") {
    return NextResponse.json(
      { error: "Your current password is required" },
      { status: 401 }
    );
  }
  if (!enabled && user.role !== "CUSTOMER") {
    return NextResponse.json(
      { error: "Email sign-in codes are required for administrator accounts" },
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

export async function DELETE(req: Request) {
  const user = await currentSecurityUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user.password) {
    return NextResponse.json(
      { error: "Set a password before unlinking your only sign-in method" },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => null);
  const password = isRecord(body) ? getString(body, "password") : undefined;
  const passwordResult = await verifySecurityPassword(user, password, req);
  if (passwordResult === "LIMITED") {
    return NextResponse.json(
      { error: "Too many password attempts. Try again later." },
      { status: 429 }
    );
  }
  if (passwordResult === "INVALID") {
    return NextResponse.json(
      { error: "Your current password is required" },
      { status: 401 }
    );
  }

  const removed = await prisma.$transaction(async (tx) => {
    const result = await tx.authIdentity.deleteMany({
      where: { userId: user.id, provider: "google" },
    });
    if (result.count) {
      await tx.user.update({
        where: { id: user.id },
        data: { sessionVersion: { increment: 1 } },
      });
    }
    return result;
  });
  if (removed.count) {
    await recordAuthEvent({
      userId: user.id,
      type: "GOOGLE_UNLINKED",
      provider: "google",
      request: req,
    });
  }

  return NextResponse.json({ ok: true });
}
