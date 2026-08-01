import assert from "node:assert/strict";
import { test } from "node:test";
import bcrypt from "bcryptjs";
import type { MfaMode, UserRole } from "@/generated/prisma/client";
import {
  AUTH_ERROR_EMAIL_NOT_VERIFIED,
  AUTH_ERROR_INVALID,
  AUTH_ERROR_MFA_REQUIRED,
  authorizeCredentials,
} from "@/lib/auth-credentials";

type TestUser = {
  id: string;
  email: string;
  canonicalEmail: string | null;
  emailVerifiedAt: Date | null;
  name: string | null;
  password: string | null;
  role: UserRole;
  mfaMode: MfaMode;
  sessionVersion: number;
};

function makeClient(seed: TestUser[]) {
  return {
    user: {
      async findFirst({
        where,
      }: {
        where: {
          OR: Array<{ email: string } | { canonicalEmail: string }>;
        };
      }) {
        return (
          seed.find((user) =>
            where.OR.some((condition) =>
              "email" in condition
                ? user.email === condition.email
                : user.canonicalEmail === condition.canonicalEmail
            )
          ) ?? null
        );
      },
      async update({
        where,
        data,
      }: {
        where: { id: string };
        data: { role: UserRole };
        select: { role: true };
      }) {
        const user = seed.find((entry) => entry.id === where.id);
        assert.ok(user);
        user.role = data.role;
        return { role: user.role };
      },
    },
  };
}

async function makeUser(overrides: Partial<TestUser> = {}): Promise<TestUser> {
  return {
    id: "user-1",
    email: "ahmad.fatayerji2004@gmail.com",
    canonicalEmail: "ahmadfatayerji2004@gmail.com",
    emailVerifiedAt: new Date(),
    name: "Ahmad",
    password: await bcrypt.hash("Correct-password1", 4),
    role: "CUSTOMER",
    mfaMode: "DISABLED",
    sessionVersion: 2,
    ...overrides,
  };
}

function customerRole(): UserRole {
  return "CUSTOMER";
}

test("credentials sign-in matches a dotless Gmail alias", async () => {
  const user = await makeUser();
  const result = await authorizeCredentials(
    {
      email: "ahmadfatayerji2004@gmail.com",
      password: "Correct-password1",
    },
    makeClient([user]),
    customerRole
  );

  assert.equal(result.id, user.id);
  assert.equal(result.email, user.email);
  assert.equal(result.sessionVersion, 2);
});

test("credentials sign-in rejects an unverified email", async () => {
  const user = await makeUser({ emailVerifiedAt: null });

  await assert.rejects(
    () =>
      authorizeCredentials(
        { email: user.email, password: "Correct-password1" },
        makeClient([user]),
        customerRole
      ),
    new RegExp(AUTH_ERROR_EMAIL_NOT_VERIFIED)
  );
});

test("credentials sign-in keeps missing-user and wrong-password errors generic", async () => {
  const user = await makeUser();

  await assert.rejects(
    () =>
      authorizeCredentials(
        { email: user.email, password: "wrong-password" },
        makeClient([user]),
        customerRole
      ),
    new RegExp(AUTH_ERROR_INVALID)
  );
});

test("email MFA requires a valid challenge for the same user", async () => {
  const user = await makeUser({ mfaMode: "EMAIL" });

  await assert.rejects(
    () =>
      authorizeCredentials(
        { email: user.email, password: "Correct-password1" },
        makeClient([user]),
        customerRole,
        async () => null
      ),
    new RegExp(AUTH_ERROR_MFA_REQUIRED)
  );

  const result = await authorizeCredentials(
    {
      email: user.email,
      password: "Correct-password1",
      challengeToken: "ticket",
      code: "12345678",
    },
    makeClient([user]),
    customerRole,
    async () => ({ userId: user.id }) as never
  );
  assert.equal(result.id, user.id);
});

test("administrator password sign-in always requires email MFA", async () => {
  const user = await makeUser({ role: "ADMIN", mfaMode: "DISABLED" });

  await assert.rejects(
    () =>
      authorizeCredentials(
        { email: user.email, password: "Correct-password1" },
        makeClient([user]),
        customerRole,
        async () => null
      ),
    new RegExp(AUTH_ERROR_MFA_REQUIRED)
  );
});

test("super-admin promotion is not persisted before email verification", async () => {
  const user = await makeUser({ emailVerifiedAt: null });

  await assert.rejects(
    () =>
      authorizeCredentials(
        { email: user.email, password: "Correct-password1" },
        makeClient([user]),
        () => "SUPER_ADMIN"
      ),
    new RegExp(AUTH_ERROR_EMAIL_NOT_VERIFIED)
  );

  assert.equal(user.role, "CUSTOMER");
});

test("super-admin promotion is persisted only after successful MFA", async () => {
  const user = await makeUser();
  const client = makeClient([user]);

  await assert.rejects(
    () =>
      authorizeCredentials(
        { email: user.email, password: "Correct-password1" },
        client,
        () => "SUPER_ADMIN",
        async () => null
      ),
    new RegExp(AUTH_ERROR_MFA_REQUIRED)
  );
  assert.equal(user.role, "CUSTOMER");

  const result = await authorizeCredentials(
    {
      email: user.email,
      password: "Correct-password1",
      challengeToken: "ticket",
      code: "12345678",
    },
    client,
    () => "SUPER_ADMIN",
    async () => ({ userId: user.id }) as never
  );

  assert.equal(user.role, "SUPER_ADMIN");
  assert.equal(result.role, "SUPER_ADMIN");
});
