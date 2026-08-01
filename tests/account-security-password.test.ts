import assert from "node:assert/strict";
import { test } from "node:test";
import bcrypt from "bcryptjs";
import type { Prisma } from "@/generated/prisma/client";
import {
  changeAccountPassword,
  type AccountSecurityPasswordClient,
} from "@/lib/account-security-password";

function makeClient({ failures = 0 }: { failures?: number } = {}) {
  const events: Prisma.AuthEventCreateArgs[] = [];
  const updates: Prisma.UserUpdateArgs[] = [];
  const client: AccountSecurityPasswordClient = {
    authEvent: {
      async findFirst() {
        return null;
      },
      async count() {
        return failures;
      },
      async create(args) {
        events.push(args);
        return args;
      },
    },
    user: {
      async update(args) {
        updates.push(args);
        return args;
      },
    },
  };
  return { client, events, updates };
}

const request = new Request("https://glampingboat.fr/api/account/security", {
  headers: { "user-agent": "account-security-test" },
});

test("password change rejects a policy-violating replacement before verification", async () => {
  const { client, events, updates } = makeClient({ failures: 8 });
  const result = await changeAccountPassword(
    {
      user: { id: "user-1", password: "stored-hash" },
      currentPassword: "Current-password1!",
      newPassword: "weak",
      request,
    },
    client
  );

  assert.equal(result, "PASSWORD_POLICY");
  assert.equal(events.length, 0);
  assert.equal(updates.length, 0);
});

test("password change rejects reuse of the current password", async () => {
  const password = "Current-password1!";
  const { client, events, updates } = makeClient();
  const result = await changeAccountPassword(
    {
      user: { id: "user-1", password: await bcrypt.hash(password, 4) },
      currentPassword: password,
      newPassword: password,
      request,
    },
    client
  );

  assert.equal(result, "PASSWORD_UNCHANGED");
  assert.equal(events.length, 1);
  assert.equal(events[0].data.type, "SIGN_IN");
  assert.equal(updates.length, 0);
});

test("password change updates the hash, increments session version, and writes an audit event", async () => {
  const currentPassword = "Current-password1!";
  const newPassword = "Replacement-password2!";
  const { client, events, updates } = makeClient();
  const result = await changeAccountPassword(
    {
      user: {
        id: "user-1",
        password: await bcrypt.hash(currentPassword, 4),
      },
      currentPassword,
      newPassword,
      request,
    },
    client
  );

  assert.equal(result, "UPDATED");
  assert.equal(updates.length, 1);
  const data = updates[0].data as {
    password: string;
    sessionVersion: { increment: number };
  };
  assert.equal(await bcrypt.compare(newPassword, data.password), true);
  assert.deepEqual(data.sessionVersion, { increment: 1 });
  assert.equal(events.length, 2);
  assert.equal(events[1].data.type, "PASSWORD_RESET");
  assert.equal(events[1].data.provider, "account-security-change");
});

test("password change preserves the account-security failure limit", async () => {
  const { client, events, updates } = makeClient({ failures: 8 });
  const result = await changeAccountPassword(
    {
      user: {
        id: "user-1",
        password: await bcrypt.hash("Current-password1!", 4),
      },
      currentPassword: "Current-password1!",
      newPassword: "Replacement-password2!",
      request,
    },
    client
  );

  assert.equal(result, "TOO_MANY_ATTEMPTS");
  assert.equal(events.length, 0);
  assert.equal(updates.length, 0);
});
