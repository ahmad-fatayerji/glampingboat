import {
  createHash,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import type {
  AuthChallengePurpose,
  AuthEventType,
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const MAX_CODE_ATTEMPTS = 5;
const CHALLENGE_RATE_WINDOW_MS = 15 * 60 * 1000;
const CHALLENGE_RATE_LIMIT = 5;

export const EMAIL_VERIFICATION_TTL_MS = 30 * 60 * 1000;
export const LOGIN_CODE_TTL_MS = 10 * 60 * 1000;
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
export const GOOGLE_LINK_TTL_MS = 10 * 60 * 1000;

export function hashAuthSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function generateToken() {
  return randomBytes(32).toString("base64url");
}

function generateCode() {
  return randomInt(0, 100_000_000).toString().padStart(8, "0");
}

function secretsMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export async function createAuthChallenge({
  userId,
  purpose,
  ttlMs,
  withCode = false,
  metadata,
}: {
  userId: string;
  purpose: AuthChallengePurpose;
  ttlMs: number;
  withCode?: boolean;
  metadata?: Prisma.InputJsonValue;
}) {
  const since = new Date(Date.now() - CHALLENGE_RATE_WINDOW_MS);
  const recentCount = await prisma.authChallenge.count({
    where: { userId, purpose, createdAt: { gte: since } },
  });

  if (recentCount >= CHALLENGE_RATE_LIMIT) {
    throw new Error("Too many requests. Try again later.");
  }

  const token = generateToken();
  const code = withCode ? generateCode() : undefined;

  const challenge = await prisma.$transaction(async (tx) => {
    await tx.authChallenge.updateMany({
      where: { userId, purpose, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    return tx.authChallenge.create({
      data: {
        userId,
        purpose,
        tokenHash: hashAuthSecret(token),
        codeHash: code ? hashAuthSecret(`${token}:${code}`) : null,
        expiresAt: new Date(Date.now() + ttlMs),
        metadata,
      },
    });
  });

  return { challenge, token, code };
}

export async function getActiveChallenge(
  token: string,
  purpose: AuthChallengePurpose
) {
  return prisma.authChallenge.findFirst({
    where: {
      tokenHash: hashAuthSecret(token),
      purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
}

export async function consumeTokenChallenge(
  token: string,
  purpose: AuthChallengePurpose
) {
  const challenge = await getActiveChallenge(token, purpose);
  if (!challenge) {
    return null;
  }

  const consumed = await prisma.authChallenge.updateMany({
    where: { id: challenge.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  return consumed.count === 1 ? challenge : null;
}

export async function verifyCodeChallenge({
  token,
  code,
  purpose,
  consume = true,
}: {
  token: string;
  code: string;
  purpose: AuthChallengePurpose;
  consume?: boolean;
}) {
  const challenge = await getActiveChallenge(token, purpose);
  if (
    !challenge?.codeHash ||
    challenge.attemptCount >= MAX_CODE_ATTEMPTS ||
    !/^\d{8}$/.test(code)
  ) {
    return null;
  }

  const providedHash = hashAuthSecret(`${token}:${code}`);
  if (!secretsMatch(challenge.codeHash, providedHash)) {
    await prisma.authChallenge.update({
      where: { id: challenge.id },
      data: { attemptCount: { increment: 1 } },
    });
    return null;
  }

  if (!consume) {
    return challenge;
  }

  const consumed = await prisma.authChallenge.updateMany({
    where: {
      id: challenge.id,
      consumedAt: null,
      attemptCount: { lt: MAX_CODE_ATTEMPTS },
    },
    data: { consumedAt: new Date() },
  });

  return consumed.count === 1 ? challenge : null;
}

export function getRequestSecurityContext(req: Request) {
  return {
    ipAddress:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null,
    userAgent: req.headers.get("user-agent"),
  };
}

export async function recordAuthEvent({
  userId,
  type,
  provider,
  request,
  metadata,
}: {
  userId?: string | null;
  type: AuthEventType;
  provider?: string;
  request?: Request;
  metadata?: Prisma.InputJsonValue;
}) {
  const context = request
    ? getRequestSecurityContext(request)
    : { ipAddress: null, userAgent: null };

  return prisma.authEvent.create({
    data: {
      userId,
      type,
      provider,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata,
    },
  });
}
