import assert from "node:assert/strict";
import test from "node:test";
import type { Prisma } from "@/generated/prisma/client";
import {
  issuePasswordResetEmail,
  PasswordResetCooldownError,
  PASSWORD_RESET_RESEND_COOLDOWN_MS,
  type PasswordResetCooldownClient,
} from "@/lib/password-reset-email";
import type { AuthChallengeWithUser } from "@/lib/auth-security";

function cooldownClient(createdAt: Date | null = null) {
  const rows: AuthChallengeWithUser[] = [];
  if (createdAt) {
    rows.push({
      id: "existing-challenge",
      userId: "user-1",
      purpose: "RESET_PASSWORD",
      tokenHash: "existing-token-hash",
      codeHash: null,
      expiresAt: new Date(createdAt.getTime() + 60 * 60 * 1000),
      consumedAt: null,
      attemptCount: 0,
      metadata: null,
      createdAt,
      user: { id: "user-1" },
    } as AuthChallengeWithUser);
  }

  let transactionQueue = Promise.resolve();
  const client = {} as PasswordResetCooldownClient;
  const transactionClient = {
    authChallenge: {
      async count() {
        return rows.length;
      },
      async updateMany() {
        for (const row of rows) row.consumedAt = new Date();
        return { count: rows.length };
      },
      async create({ data }: Prisma.AuthChallengeCreateArgs) {
        const input = data as Prisma.AuthChallengeUncheckedCreateInput;
        const row = {
          id: `challenge-${rows.length + 1}`,
          userId: input.userId,
          purpose: input.purpose,
          tokenHash: input.tokenHash,
          codeHash: input.codeHash ?? null,
          expiresAt: input.expiresAt as Date,
          consumedAt: null,
          attemptCount: 0,
          metadata: input.metadata ?? null,
          createdAt: new Date(),
          user: { id: input.userId },
        } as AuthChallengeWithUser;
        rows.push(row);
        return row;
      },
      async findFirst() {
        const row = rows.at(-1);
        return row ? { createdAt: row.createdAt } : null;
      },
      async update() {
        throw new Error("Not implemented in cooldown test client");
      },
    },
    async $queryRawUnsafe<T = unknown>() {
      return [] as T;
    },
  };

  client.$transaction = (callback) => {
    const result = transactionQueue.then(() => callback(transactionClient));
    transactionQueue = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  };

  return client;
}

test("rejects a second reset request inside the cooldown window", async () => {
  const error = await issuePasswordResetEmail({
    userId: "user-1",
    email: "user@example.com",
    locale: "en",
    origin: "https://example.test",
    cooldownClient: cooldownClient(new Date(Date.now() - 5_000)),
  }).catch((caught: unknown) => caught);

  assert.ok(error instanceof PasswordResetCooldownError);
  assert.ok(error.retryAfterMs > 0);
  assert.ok(error.retryAfterMs <= PASSWORD_RESET_RESEND_COOLDOWN_MS);
});

test("serializes concurrent reset requests so only one email is sent", async () => {
  const client = cooldownClient();
  const sentMessages: unknown[] = [];
  const request = () =>
    issuePasswordResetEmail({
      userId: "user-1",
      email: "user@example.com",
      locale: "en",
      origin: "https://example.test",
      cooldownClient: client,
      async sendMail(message) {
        sentMessages.push(message);
      },
    });

  const results = await Promise.allSettled([request(), request()]);

  assert.equal(results.filter(({ status }) => status === "fulfilled").length, 1);
  const rejection = results.find(({ status }) => status === "rejected");
  assert.equal(rejection?.status, "rejected");
  if (rejection?.status === "rejected") {
    assert.ok(rejection.reason instanceof PasswordResetCooldownError);
  }
  assert.equal(sentMessages.length, 1);
});
