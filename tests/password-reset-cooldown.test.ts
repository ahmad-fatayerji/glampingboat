import assert from "node:assert/strict";
import test from "node:test";
import {
  issuePasswordResetEmail,
  PasswordResetCooldownError,
  PASSWORD_RESET_RESEND_COOLDOWN_MS,
} from "@/lib/password-reset-email";

function cooldownClient(createdAt: Date | null) {
  return {
    authChallenge: {
      async findFirst() {
        return createdAt ? { createdAt } : null;
      },
    },
  };
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
