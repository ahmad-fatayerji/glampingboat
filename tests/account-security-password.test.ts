import assert from "node:assert/strict";
import { test } from "node:test";
import bcrypt from "bcryptjs";
import type { Prisma } from "@/generated/prisma/client";
import {
  changeAccountPassword,
  type AccountSecurityEventRecorder,
  type AccountSecurityPasswordClient,
} from "@/lib/account-security-password";

function makeClient({ failures = 0 }: { failures?: number } = {}) {
  const events: Parameters<AccountSecurityEventRecorder>[0][] = [];
  const updates: Prisma.UserUpdateArgs[] = [];
  const client: AccountSecurityPasswordClient = {
    authEvent: {
      async findFirst() {
        return null;
      },
      async count() {
        return failures;
      },
    },
    user: {
      async update(args) {
        updates.push(args);
        return args;
      },
    },
  };
  const recordEvent: AccountSecurityEventRecorder = async (event) => {
    events.push(event);
    return event;
  };
  return { dependencies: { client, recordEvent }, events, updates };
}

const request = new Request("https://glampingboat.fr/api/account/security", {
  headers: { "user-agent": "account-security-test" },
});

test("password change rejects a policy-violating replacement before verification", async () => {
  const { dependencies, events, updates } = makeClient();
  const result = await changeAccountPassword(
    {
      user: { id: "user-1", password: "stored-hash" },
      currentPassword: "Current-password1!",
      newPassword: "weak",
      request,
    },
    dependencies
  );

  assert.equal(result, "PASSWORD_POLICY");
  assert.equal(events.length, 0);
  assert.equal(updates.length, 0);
});

test("password change rejects reuse of the current password", async () => {
  const password = "Current-password1!";
  const { dependencies, events, updates } = makeClient();
  const result = await changeAccountPassword(
    {
      user: { id: "user-1", password: await bcrypt.hash(password, 4) },
      currentPassword: password,
      newPassword: password,
      request,
    },
    dependencies
  );

  assert.equal(result, "PASSWORD_UNCHANGED");
  assert.equal(events.length, 1);
  assert.equal(events[0].type, "SIGN_IN");
  assert.equal(updates.length, 0);
});

test("password change updates the hash, increments session version, and writes an audit event", async () => {
  const currentPassword = "Current-password1!";
  const newPassword = "Replacement-password2!";
  const { dependencies, events, updates } = makeClient();
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
    dependencies
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
  assert.equal(events[1].type, "PASSWORD_RESET");
  assert.equal(events[1].provider, "account-security-change");
});

test("password change reports the failure limit before password policy errors", async () => {
  const { dependencies, events, updates } = makeClient({ failures: 8 });
  const result = await changeAccountPassword(
    {
      user: {
        id: "user-1",
        password: await bcrypt.hash("Current-password1!", 4),
      },
      currentPassword: "Current-password1!",
      newPassword: "weak",
      request,
    },
    dependencies
  );

  assert.equal(result, "TOO_MANY_ATTEMPTS");
  assert.equal(events.length, 0);
  assert.equal(updates.length, 0);
});
