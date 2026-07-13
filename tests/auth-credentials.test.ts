import assert from "node:assert/strict";
import { test } from "node:test";
import type { UserRole } from "@/generated/prisma/client";
import { authorizeCredentials } from "@/lib/auth-credentials";
import { PASSWORD_POLICY_ERROR } from "@/lib/password-policy";

type TestUser = {
  id: string;
  email: string;
  name: string | null;
  password: string | null;
  role: UserRole;
};

function makeClient(seed: TestUser[] = []) {
  const users = new Map(seed.map((user) => [user.email, user]));

  return {
    users,
    client: {
      user: {
        async findUnique({ where }: { where: { email: string } }) {
          return users.get(where.email) ?? null;
        },
        async update({
          where,
          data,
        }: {
          where: { id: string };
          data: { role: UserRole };
        }) {
          const user = [...users.values()].find((entry) => entry.id === where.id);
          assert.ok(user);
          user.role = data.role;
          return { role: user.role };
        },
        async create({
          data,
        }: {
          data: {
            email: string;
            password: string;
            name: string;
            avatar: string;
            role: UserRole;
          };
        }) {
          const user = {
            id: `user-${users.size + 1}`,
            email: data.email,
            name: data.name,
            password: data.password,
            role: data.role,
          };
          users.set(user.email, user);
          return user;
        },
      },
    },
  };
}

function customerRole(): UserRole {
  return "CUSTOMER";
}

test("credentials signup creates a normalized user", async () => {
  const { client, users } = makeClient();

  const result = await authorizeCredentials(
    {
      email: " NewUser@Example.COM ",
      password: "Correct-password1",
      isSignup: "true",
    },
    client,
    customerRole
  );

  assert.equal(result.email, "newuser@example.com");
  assert.equal(result.role, "CUSTOMER");
  assert.equal(users.size, 1);
  assert.ok(users.get("newuser@example.com")?.password);
});

test("credentials signup rejects weak passwords", async () => {
  const { client, users } = makeClient();

  await assert.rejects(
    () =>
      authorizeCredentials(
        {
          email: "newuser@example.com",
          password: "weak-password",
          isSignup: "true",
        },
        client,
        customerRole
      ),
    new RegExp(PASSWORD_POLICY_ERROR.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  );

  assert.equal(users.size, 0);
});

test("credentials signin does not create missing users", async () => {
  const { client, users } = makeClient();

  await assert.rejects(
    () =>
      authorizeCredentials(
        {
          email: "missing@example.com",
          password: "wrong-password",
          isSignup: "false",
        },
        client,
        customerRole
      ),
    /Invalid email or password/
  );

  assert.equal(users.size, 0);
});

test("credentials signup rejects existing users", async () => {
  const { client } = makeClient([
    {
      id: "user-1",
      email: "existing@example.com",
      name: "",
      password: "stored-hash",
      role: "CUSTOMER",
    },
  ]);

  await assert.rejects(
    () =>
      authorizeCredentials(
        {
          email: "existing@example.com",
          password: "new-password",
          isSignup: "true",
        },
        client,
        customerRole
      ),
    /An account already exists for this email/
  );
});
