import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { isSuperAdminEmail } from "@/lib/super-admin";
import {
  createAuthChallenge,
  EMAIL_VERIFICATION_TTL_MS,
  getRequestSecurityContext,
  recordAuthEvent,
} from "@/lib/auth-security";
import { sendVerificationEmail } from "@/lib/auth-emails";
import { normalizeEmailAddress } from "@/lib/email-identity";
import {
  PASSWORD_POLICY_ERROR,
  validatePasswordPolicy,
} from "@/lib/password-policy";
import { prisma } from "@/lib/prisma";
import { getString, isRecord } from "@/lib/type-guards";
import { findAccountCandidates } from "@/lib/user-email-lookup";

function verificationUrl(req: Request, token: string) {
  const origin = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
  return `${origin}/verify-email/${encodeURIComponent(token)}`;
}

export async function POST(req: Request) {
  const { ipAddress } = getRequestSecurityContext(req);
  if (ipAddress) {
    const recentSignups = await prisma.authEvent.count({
      where: {
        type: "SIGNUP",
        ipAddress,
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    });
    if (recentSignups >= 8) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }
  }

  const body = await req.json().catch(() => null);
  const rawEmail = isRecord(body) ? getString(body, "email") : undefined;
  const password = isRecord(body) ? getString(body, "password") : undefined;
  const normalized = rawEmail ? normalizeEmailAddress(rawEmail) : null;

  if (!normalized || !password) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }
  if (!validatePasswordPolicy(password).valid) {
    return NextResponse.json({ error: PASSWORD_POLICY_ERROR }, { status: 400 });
  }

  const candidates = await findAccountCandidates(normalized);

  if (candidates.length > 1) {
    return NextResponse.json(
      { error: "This email requires an account review. Please contact support." },
      { status: 409 }
    );
  }

  let user = candidates[0];
  if (user?.emailVerifiedAt) {
    return NextResponse.json(
      { error: "An account already exists for this email" },
      { status: 409 }
    );
  }

  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          email: normalized.email,
          canonicalEmail: normalized.canonicalEmail,
          password: await bcrypt.hash(password, 12),
          name: "",
          avatar: "",
          role: isSuperAdminEmail(normalized.email) ? "SUPER_ADMIN" : "CUSTOMER",
        },
      });
    } catch (error) {
      if (isRecord(error) && error.code === "P2002") {
        return NextResponse.json(
          { error: "An account already exists for this email" },
          { status: 409 }
        );
      }
      throw error;
    }
    await recordAuthEvent({
      userId: user.id,
      type: "SIGNUP",
      provider: "credentials",
      request: req,
    });
  }

  try {
    const { token } = await createAuthChallenge({
      userId: user.id,
      purpose: "VERIFY_EMAIL",
      ttlMs: EMAIL_VERIFICATION_TTL_MS,
    });
    await sendVerificationEmail(user.email, verificationUrl(req, token));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to send verification email";
    const status = /Too many requests/i.test(message) ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json({ ok: true, verificationRequired: true });
}
