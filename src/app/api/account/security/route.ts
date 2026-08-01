import { NextResponse } from "next/server";
import { auth } from "@auth";
import {
  AuthChallengeRateLimitError,
  recordAuthEvent,
} from "@/lib/auth-security";
import {
  sendPasswordChangedEmail,
  sendSecuritySettingEmail,
} from "@/lib/auth-emails";
import {
  changeAccountPassword,
  verifyAccountSecurityPassword,
  type AccountPasswordChangeResult,
} from "@/lib/account-security-password";
import { prisma } from "@/lib/prisma";
import { getBoolean, getString, isRecord } from "@/lib/type-guards";
import { normalizeEmailLocale } from "@/lib/email-i18n";
import { PASSWORD_POLICY_ERROR } from "@/lib/password-policy";
import {
  issuePasswordResetEmail,
  PasswordResetCooldownError,
} from "@/lib/password-reset-email";

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

export async function POST(req: Request) {
  const user = await currentSecurityUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.password) {
    return NextResponse.json(
      { code: "PASSWORD_ALREADY_SET", error: "This account already has a password" },
      { status: 409 }
    );
  }
  if (!user.emailVerifiedAt) {
    return NextResponse.json(
      {
        code: "EMAIL_VERIFICATION_REQUIRED",
        error: "Verify your email before setting a password",
      },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const locale = normalizeEmailLocale(
    isRecord(body) ? getString(body, "locale") : undefined
  );
  try {
    const origin = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
    await issuePasswordResetEmail({
      userId: user.id,
      email: user.email,
      locale,
      origin,
    });
  } catch (error) {
    if (error instanceof PasswordResetCooldownError) {
      return NextResponse.json(
        {
          code: "PASSWORD_SETUP_RATE_LIMITED",
          error: "A link was just sent. Check your inbox before retrying.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(error.retryAfterMs / 1000)),
          },
        }
      );
    }
    if (error instanceof AuthChallengeRateLimitError) {
      return NextResponse.json(
        {
          code: "PASSWORD_SETUP_RATE_LIMITED",
          error: "Too many password setup requests. Try again later.",
        },
        { status: 429 }
      );
    }
    console.error("Failed to issue password setup link", error);
    return NextResponse.json(
      { code: "PASSWORD_SETUP_ERROR", error: "Unable to send password setup link" },
      { status: 500 }
    );
  }

  await recordAuthEvent({
    userId: user.id,
    type: "PASSWORD_SETUP_REQUESTED",
    provider: "email",
    request: req,
  }).catch((error) =>
    console.error("Failed to record password setup request", error)
  );

  return NextResponse.json({ ok: true });
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
  const passwordResult = await verifyAccountSecurityPassword({
    user,
    password,
    request: req,
  });
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
  const body = await req.json().catch(() => null);
  const currentPassword = isRecord(body)
    ? getString(body, "currentPassword")
    : undefined;
  const newPassword = isRecord(body)
    ? getString(body, "newPassword")
    : undefined;
  const locale = normalizeEmailLocale(
    isRecord(body) ? getString(body, "locale") : undefined
  );
  const result = await changeAccountPassword({
    user,
    currentPassword,
    request: req,
    newPassword,
  });
  const errorResponse = passwordChangeErrorResponse(result);
  if (errorResponse) return errorResponse;

  await sendPasswordChangedEmail(user.email, locale).catch((error) =>
    console.error("Failed to send password-change email", error)
  );

  return NextResponse.json({ ok: true });
}

function passwordChangeErrorResponse(result: AccountPasswordChangeResult) {
  if (result === "UPDATED") return null;
  const errors: Record<
    Exclude<AccountPasswordChangeResult, "UPDATED">,
    { status: number; error: string }
  > = {
    PASSWORD_NOT_SET: {
      status: 409,
      error: "This account does not have a password",
    },
    PASSWORD_POLICY: { status: 400, error: PASSWORD_POLICY_ERROR },
    PASSWORD_UNCHANGED: {
      status: 400,
      error: "Choose a password different from your current password",
    },
    CURRENT_PASSWORD_REQUIRED: {
      status: 401,
      error: "Your current password is required",
    },
    TOO_MANY_ATTEMPTS: {
      status: 429,
      error: "Too many password attempts. Try again later.",
    },
  };
  const match = errors[result];
  return NextResponse.json(
    { code: result, error: match.error },
    { status: match.status }
  );
}
