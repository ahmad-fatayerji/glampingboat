import { NextResponse } from "next/server";
import {
  createAuthChallenge,
  getRequestSecurityContext,
  LOGIN_CODE_TTL_MS,
  recordAuthEvent,
} from "@/lib/auth-security";
import {
  AUTH_ERROR_EMAIL_NOT_VERIFIED,
  requiresEmailMfa,
  verifyCredentialsPassword,
} from "@/lib/auth-credentials";
import { sendLoginCodeEmail } from "@/lib/auth-emails";
import { prisma } from "@/lib/prisma";
import { getString, isRecord } from "@/lib/type-guards";

const FAILED_LOGIN_LIMIT = 12;

export async function POST(req: Request) {
  const context = getRequestSecurityContext(req);
  if (context.ipAddress) {
    const failed = await prisma.authEvent.count({
      where: {
        type: "SIGN_IN_FAILED",
        ipAddress: context.ipAddress,
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    });
    if (failed >= FAILED_LOGIN_LIMIT) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }
  }

  const body = await req.json().catch(() => null);
  const email = isRecord(body) ? getString(body, "email") : undefined;
  const password = isRecord(body) ? getString(body, "password") : undefined;
  const user =
    email && password
      ? await verifyCredentialsPassword(email, password, prisma)
      : null;

  if (!user) {
    await recordAuthEvent({
      type: "SIGN_IN_FAILED",
      provider: "credentials",
      request: req,
    });
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  if (!user.emailVerifiedAt) {
    return NextResponse.json(
      { error: AUTH_ERROR_EMAIL_NOT_VERIFIED },
      { status: 403 }
    );
  }

  if (!requiresEmailMfa(user)) {
    return NextResponse.json({ ok: true, requiresMfa: false });
  }

  try {
    const { token, code } = await createAuthChallenge({
      userId: user.id,
      purpose: "LOGIN_EMAIL_OTP",
      ttlMs: LOGIN_CODE_TTL_MS,
      withCode: true,
    });
    await sendLoginCodeEmail(user.email, code!);
    await recordAuthEvent({
      userId: user.id,
      type: "LOGIN_CODE_SENT",
      provider: "credentials",
      request: req,
    });
    return NextResponse.json({
      ok: true,
      requiresMfa: true,
      challengeToken: token,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to send sign-in code";
    return NextResponse.json(
      { error: message },
      { status: /Too many requests/i.test(message) ? 429 : 500 }
    );
  }
}
