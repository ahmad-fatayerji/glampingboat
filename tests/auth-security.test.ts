import assert from "node:assert/strict";
import { test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";
import {
  AuthChallengeRateLimitError,
  consumeTokenChallenge,
  createAuthChallenge,
  getLoginRateLimit,
  getTrustedClientIp,
  hashAuthSecret,
  type AuthChallengeClient,
  type AuthChallengeWithUser,
  type LoginRateLimitClient,
  verifyCodeChallenge,
} from "@/lib/auth-security";

type TestRow = AuthChallengeWithUser;

function makeChallengeClient() {
  const rows: TestRow[] = [];
  const client = {} as AuthChallengeClient;

  client.authChallenge = {
    async count({ where }) {
      return rows.filter(
        (row) =>
          (!where?.userId || row.userId === where.userId) &&
          (!where?.purpose || row.purpose === where.purpose) &&
          (!where?.createdAt ||
            typeof where.createdAt !== "object" ||
            !("gte" in where.createdAt) ||
            row.createdAt >= (where.createdAt.gte as Date))
      ).length;
    },
    async updateMany({ where, data }) {
      let count = 0;
      for (const row of rows) {
        const matches =
          (!where?.id || row.id === where.id) &&
          (!where?.userId || row.userId === where.userId) &&
          (!where?.purpose || row.purpose === where.purpose) &&
          (where?.consumedAt !== null || row.consumedAt === null) &&
          (!where?.expiresAt ||
            typeof where.expiresAt !== "object" ||
            !("gt" in where.expiresAt) ||
            row.expiresAt > (where.expiresAt.gt as Date)) &&
          (!where?.attemptCount ||
            typeof where.attemptCount !== "object" ||
            !("lt" in where.attemptCount) ||
            row.attemptCount < (where.attemptCount.lt as number));
        if (!matches) continue;
        count += 1;
        if (data.consumedAt instanceof Date) row.consumedAt = data.consumedAt;
      }
      return { count };
    },
    async create({ data }) {
      const input = data as Prisma.AuthChallengeUncheckedCreateInput;
      const row = {
        id: `challenge-${rows.length + 1}`,
        userId: input.userId,
        purpose: input.purpose,
        tokenHash: input.tokenHash,
        codeHash: input.codeHash ?? null,
        expiresAt: input.expiresAt as Date,
        consumedAt: null,
        attemptCount: input.attemptCount ?? 0,
        metadata: input.metadata ?? null,
        createdAt: new Date(),
        user: { id: input.userId },
      } as TestRow;
      rows.push(row);
      return row;
    },
    async findFirst({ where }) {
      return (
        rows.find(
          (row) =>
            (!where?.tokenHash || row.tokenHash === where.tokenHash) &&
            (!where?.purpose || row.purpose === where.purpose) &&
            (where?.consumedAt !== null || row.consumedAt === null) &&
            (!where?.expiresAt ||
              typeof where.expiresAt !== "object" ||
              !("gt" in where.expiresAt) ||
              row.expiresAt > (where.expiresAt.gt as Date))
        ) ?? null
      );
    },
    async update({ where, data }) {
      const row = rows.find((entry) => entry.id === where.id);
      assert.ok(row);
      if (
        typeof data.attemptCount === "object" &&
        data.attemptCount &&
        "increment" in data.attemptCount
      ) {
        row.attemptCount += Number(data.attemptCount.increment);
      }
      return row;
    },
  };
  client.$transaction = async (callback) => callback(client);

  return { client, rows };
}

test("creating a replacement challenge consumes the previous challenge", async () => {
  const { client, rows } = makeChallengeClient();
  const first = await createAuthChallenge(
    { userId: "user-1", purpose: "VERIFY_EMAIL", ttlMs: 60_000 },
    client
  );
  const second = await createAuthChallenge(
    { userId: "user-1", purpose: "VERIFY_EMAIL", ttlMs: 60_000 },
    client
  );

  assert.ok(rows[0].consumedAt);
  assert.equal(rows[1].consumedAt, null);
  assert.notEqual(first.token, second.token);
});

test("only one concurrent consumer can use a token", async () => {
  const { client } = makeChallengeClient();
  const { token } = await createAuthChallenge(
    { userId: "user-1", purpose: "RESET_PASSWORD", ttlMs: 60_000 },
    client
  );

  const results = await Promise.all([
    consumeTokenChallenge(token, "RESET_PASSWORD", client),
    consumeTokenChallenge(token, "RESET_PASSWORD", client),
  ]);
  assert.equal(results.filter(Boolean).length, 1);
});

test("five wrong codes exhaust a challenge", async () => {
  const { client, rows } = makeChallengeClient();
  const token = "known-token";
  rows.push({
    id: "challenge-code",
    userId: "user-1",
    purpose: "LOGIN_EMAIL_OTP",
    tokenHash: hashAuthSecret(token),
    codeHash: hashAuthSecret(`${token}:12345678`),
    expiresAt: new Date(Date.now() + 60_000),
    consumedAt: null,
    attemptCount: 0,
    metadata: null,
    createdAt: new Date(),
    user: { id: "user-1" },
  } as TestRow);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    assert.equal(
      await verifyCodeChallenge({
        token,
        code: "00000000",
        purpose: "LOGIN_EMAIL_OTP",
        client,
      }),
      null
    );
  }
  assert.equal(rows[0].attemptCount, 5);
  assert.equal(
    await verifyCodeChallenge({
      token,
      code: "12345678",
      purpose: "LOGIN_EMAIL_OTP",
      client,
    }),
    null
  );
});

test("the sixth challenge in fifteen minutes is rate limited", async () => {
  const { client } = makeChallengeClient();
  for (let index = 0; index < 5; index += 1) {
    await createAuthChallenge(
      { userId: "user-1", purpose: "VERIFY_EMAIL", ttlMs: 60_000 },
      client
    );
  }
  await assert.rejects(
    () =>
      createAuthChallenge(
        { userId: "user-1", purpose: "VERIFY_EMAIL", ttlMs: 60_000 },
        client
      ),
    AuthChallengeRateLimitError
  );
});

test("forwarded IPs are ignored with an operational warning when proxy trust is disabled", () => {
  const previous = process.env.AUTH_TRUSTED_PROXY_HOPS;
  const originalWarn = console.warn;
  let warning = "";
  console.warn = (message) => {
    warning = String(message);
  };
  delete process.env.AUTH_TRUSTED_PROXY_HOPS;
  try {
    assert.equal(
      getTrustedClientIp(new Headers({ "x-forwarded-for": "198.51.100.9" })),
      null
    );
    assert.match(warning, /IP throttling.*disabled/i);
  } finally {
    console.warn = originalWarn;
    if (previous === undefined) delete process.env.AUTH_TRUSTED_PROXY_HOPS;
    else process.env.AUTH_TRUSTED_PROXY_HOPS = previous;
  }
});

test("trusted proxy depth selects from the right and rejects spoofed first hops", () => {
  const previous = process.env.AUTH_TRUSTED_PROXY_HOPS;
  process.env.AUTH_TRUSTED_PROXY_HOPS = "1";
  assert.equal(
    getTrustedClientIp(
      new Headers({
        "x-forwarded-for": "203.0.113.7, 198.51.100.9",
      })
    ),
    "198.51.100.9"
  );
  if (previous === undefined) delete process.env.AUTH_TRUSTED_PROXY_HOPS;
  else process.env.AUTH_TRUSTED_PROXY_HOPS = previous;
});

test("account login limiting reaches the boundary through an injected store", async () => {
  const successfulAt = new Date(Date.now() - 60_000);
  const observedWindows: Date[] = [];
  const client: LoginRateLimitClient = {
    authEvent: {
      async findFirst() {
        return { createdAt: successfulAt };
      },
      async count({ where }) {
        if (where?.subjectHash) {
          const createdAt = where.createdAt;
          if (
            createdAt &&
            typeof createdAt === "object" &&
            "gte" in createdAt &&
            createdAt.gte instanceof Date
          ) {
            observedWindows.push(createdAt.gte);
          }
          return 8;
        }
        return 0;
      },
    },
  };

  const result = await getLoginRateLimit(
    { email: "Customer@example.com", ipAddress: "198.51.100.9" },
    client
  );
  assert.equal(result.limited, true);
  assert.deepEqual(observedWindows, [successfulAt]);
});

test("the trusted-IP safety bucket is enforced independently", async () => {
  const client: LoginRateLimitClient = {
    authEvent: {
      async findFirst() {
        return null;
      },
      async count({ where }) {
        return where?.ipAddress ? 40 : 0;
      },
    },
  };

  const result = await getLoginRateLimit(
    { email: "customer@example.com", ipAddress: "198.51.100.9" },
    client
  );
  assert.equal(result.limited, true);
});
