import {
  createHash,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import { isIP } from "node:net";
import type {
  AuthChallenge,
  AuthChallengePurpose,
  AuthEventType,
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeEmailAddress } from "@/lib/email-identity";

const MAX_CODE_ATTEMPTS = 5;
const CHALLENGE_RATE_WINDOW_MS = 15 * 60 * 1000;
const CHALLENGE_RATE_LIMIT = 5;
const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_ACCOUNT_FAILURE_LIMIT = 8;
const LOGIN_IP_FAILURE_LIMIT = 40;
let warnedAboutUntrustedForwardedFor = false;

export class AuthChallengeRateLimitError extends Error {
  constructor() {
    super("Too many requests. Try again later.");
    this.name = "AuthChallengeRateLimitError";
  }
}

export type AuthChallengeWithUser = Prisma.AuthChallengeGetPayload<{
  include: { user: true };
}>;

export type AuthChallengeStore = {
  count(args: Prisma.AuthChallengeCountArgs): Promise<number>;
  updateMany(args: Prisma.AuthChallengeUpdateManyArgs): Promise<{ count: number }>;
  create(args: Prisma.AuthChallengeCreateArgs): Promise<AuthChallenge>;
  findFirst(
    args: Prisma.AuthChallengeFindFirstArgs
  ): Promise<AuthChallengeWithUser | null>;
  update(args: Prisma.AuthChallengeUpdateArgs): Promise<AuthChallenge>;
};

export type AuthChallengeTransactionClient = {
  authChallenge: Pick<
    AuthChallengeStore,
    "count" | "updateMany" | "create"
  >;
};

export type AuthChallengeClient = {
  authChallenge: AuthChallengeStore;
  $transaction<T>(
    callback: (tx: AuthChallengeTransactionClient) => Promise<T>
  ): Promise<T>;
};

const defaultChallengeClient = prisma as unknown as AuthChallengeClient;

export const EMAIL_VERIFICATION_TTL_MS = 30 * 60 * 1000;
export const LOGIN_CODE_TTL_MS = 10 * 60 * 1000;
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
export const GOOGLE_LINK_TTL_MS = 10 * 60 * 1000;
export const GOOGLE_LINK_INTENT_COOKIE = "gb_google_link_intent";
export const GOOGLE_LINK_CHALLENGE_COOKIE = "gb_google_link_challenge";

export function getAuthCookieOptions(ttlMs: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure:
      process.env.NODE_ENV === "production" ||
      process.env.NEXTAUTH_URL?.startsWith("https://") === true,
    path: "/",
    maxAge: Math.floor(ttlMs / 1000),
  };
}

export function hashAuthSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getAuthSubjectHash(rawEmail: string | null | undefined) {
  if (!rawEmail) return null;
  const normalized = normalizeEmailAddress(rawEmail);
  const identity = normalized?.canonicalEmail ?? rawEmail.trim().toLowerCase();
  return identity ? hashAuthSecret(identity) : null;
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
}, client: AuthChallengeClient = defaultChallengeClient) {
  return client.$transaction((tx) =>
    createAuthChallengeInTransaction(
      { userId, purpose, ttlMs, withCode, metadata },
      tx
    )
  );
}

export async function createAuthChallengeInTransaction({
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
}, client: AuthChallengeTransactionClient) {
  const since = new Date(Date.now() - CHALLENGE_RATE_WINDOW_MS);
  const recentCount = await client.authChallenge.count({
    where: { userId, purpose, createdAt: { gte: since } },
  });

  if (recentCount >= CHALLENGE_RATE_LIMIT) {
    throw new AuthChallengeRateLimitError();
  }

  const token = generateToken();
  const code = withCode ? generateCode() : undefined;

  await client.authChallenge.updateMany({
    where: { userId, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const challenge = await client.authChallenge.create({
    data: {
      userId,
      purpose,
      tokenHash: hashAuthSecret(token),
      codeHash: code ? hashAuthSecret(`${token}:${code}`) : null,
      expiresAt: new Date(Date.now() + ttlMs),
      metadata,
    },
  });

  return { challenge, token, code };
}

export async function getActiveChallenge(
  token: string,
  purpose: AuthChallengePurpose,
  client: AuthChallengeClient = defaultChallengeClient
) {
  return client.authChallenge.findFirst({
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
  purpose: AuthChallengePurpose,
  client: AuthChallengeClient = defaultChallengeClient
) {
  const challenge = await getActiveChallenge(token, purpose, client);
  if (!challenge) {
    return null;
  }

  const consumed = await client.authChallenge.updateMany({
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
  client = defaultChallengeClient,
}: {
  token: string;
  code: string;
  purpose: AuthChallengePurpose;
  consume?: boolean;
  client?: AuthChallengeClient;
}) {
  const challenge = await getActiveChallenge(token, purpose, client);
  if (
    !challenge?.codeHash ||
    challenge.attemptCount >= MAX_CODE_ATTEMPTS ||
    !/^\d{8}$/.test(code)
  ) {
    return null;
  }

  const providedHash = hashAuthSecret(`${token}:${code}`);
  if (!secretsMatch(challenge.codeHash, providedHash)) {
    await client.authChallenge.update({
      where: { id: challenge.id },
      data: { attemptCount: { increment: 1 } },
    });
    return null;
  }

  if (!consume) {
    return challenge;
  }

  const consumed = await client.authChallenge.updateMany({
    where: {
      id: challenge.id,
      consumedAt: null,
      attemptCount: { lt: MAX_CODE_ATTEMPTS },
    },
    data: { consumedAt: new Date() },
  });

  return consumed.count === 1 ? challenge : null;
}

type HeaderSource =
  | Headers
  | Record<string, string | string[] | undefined>;

function readHeader(source: HeaderSource, name: string) {
  if (source instanceof Headers) return source.get(name);
  const value = source[name] ?? source[name.toLowerCase()];
  return Array.isArray(value) ? value.join(",") : value ?? null;
}

function normalizeIp(value: string) {
  const candidate = value.trim();
  if (isIP(candidate)) return candidate;

  const bracketed = /^\[([^\]]+)\](?::\d+)?$/.exec(candidate)?.[1];
  if (bracketed && isIP(bracketed)) return bracketed;

  const ipv4WithPort = /^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/.exec(candidate)?.[1];
  return ipv4WithPort && isIP(ipv4WithPort) ? ipv4WithPort : null;
}

export function getTrustedClientIp(headers: HeaderSource) {
  const trustedHops = Number.parseInt(
    process.env.AUTH_TRUSTED_PROXY_HOPS ?? "0",
    10
  );
  if (!Number.isSafeInteger(trustedHops) || trustedHops < 1) {
    if (
      !warnedAboutUntrustedForwardedFor &&
      readHeader(headers, "x-forwarded-for")
    ) {
      warnedAboutUntrustedForwardedFor = true;
      console.warn(
        "[auth] x-forwarded-for was received while AUTH_TRUSTED_PROXY_HOPS is 0; IP throttling and IP audit attribution are disabled."
      );
    }
    return null;
  }

  const forwarded = readHeader(headers, "x-forwarded-for");
  if (!forwarded) return null;
  const chain = forwarded
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const clientIndex = chain.length - trustedHops;
  return clientIndex >= 0 ? normalizeIp(chain[clientIndex]) : null;
}

export function getRequestSecurityContext(req: Request) {
  return {
    ipAddress: getTrustedClientIp(req.headers),
    userAgent: req.headers.get("user-agent"),
  };
}

export function getHeaderSecurityContext(headers: HeaderSource) {
  return {
    ipAddress: getTrustedClientIp(headers),
    userAgent: readHeader(headers, "user-agent"),
  };
}

export type LoginRateLimitClient = {
  authEvent: {
    findFirst(args: Prisma.AuthEventFindFirstArgs): Promise<{
      createdAt: Date;
    } | null>;
    count(args: Prisma.AuthEventCountArgs): Promise<number>;
  };
};

const defaultLoginRateLimitClient = prisma as unknown as LoginRateLimitClient;

export async function getLoginRateLimit({
  email,
  ipAddress,
}: {
  email: string | null | undefined;
  ipAddress: string | null;
}, client: LoginRateLimitClient = defaultLoginRateLimitClient) {
  const subjectHash = getAuthSubjectHash(email);
  const windowStart = new Date(Date.now() - LOGIN_RATE_WINDOW_MS);
  const lastSuccess = subjectHash
    ? await client.authEvent.findFirst({
        where: {
          type: "SIGN_IN",
          subjectHash,
          createdAt: { gte: windowStart },
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      })
    : null;
  const accountWindowStart = lastSuccess?.createdAt ?? windowStart;

  const [accountFailures, ipFailures] = await Promise.all([
    subjectHash
      ? client.authEvent.count({
          where: {
            type: "SIGN_IN_FAILED",
            subjectHash,
            createdAt: { gte: accountWindowStart },
          },
        })
      : 0,
    ipAddress
      ? client.authEvent.count({
          where: {
            type: "SIGN_IN_FAILED",
            ipAddress,
            createdAt: { gte: windowStart },
          },
        })
      : 0,
  ]);

  return {
    limited:
      accountFailures >= LOGIN_ACCOUNT_FAILURE_LIMIT ||
      ipFailures >= LOGIN_IP_FAILURE_LIMIT,
    subjectHash,
  };
}

export async function recordAuthEvent({
  userId,
  type,
  provider,
  request,
  subject,
  metadata,
}: {
  userId?: string | null;
  type: AuthEventType;
  provider?: string;
  request?: Request;
  subject?: string | null;
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
      subjectHash: getAuthSubjectHash(subject),
      userAgent: context.userAgent,
      metadata,
    },
  });
}
