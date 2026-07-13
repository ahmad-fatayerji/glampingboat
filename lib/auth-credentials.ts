import type { UserRole } from "@/generated/prisma/client";
import bcrypt from "bcryptjs";
import {
  PASSWORD_POLICY_ERROR,
  validatePasswordPolicy,
} from "@/lib/password-policy";

export type CredentialsInput = Partial<
  Record<"email" | "password" | "isSignup", unknown>
>;

export type CredentialsUserRecord = {
  id: string;
  email: string;
  name: string | null;
  password: string | null;
  role: UserRole;
};

export type CredentialsAuthClient = {
  user: {
    findUnique(args: {
      where: { email: string };
    }): Promise<CredentialsUserRecord | null>;
    update(args: {
      where: { id: string };
      data: { role: UserRole };
      select: { role: true };
    }): Promise<{ role: UserRole }>;
    create(args: {
      data: {
        email: string;
        password: string;
        name: string;
        avatar: string;
        role: UserRole;
      };
    }): Promise<CredentialsUserRecord>;
  };
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function authorizeCredentials(
  creds: CredentialsInput | undefined,
  client: CredentialsAuthClient,
  getInitialRoleForEmail: (email: string) => UserRole
) {
  if (
    !creds ||
    typeof creds.email !== "string" ||
    typeof creds.password !== "string"
  ) {
    throw new Error("Missing email or password");
  }

  const email = normalizeEmail(creds.email);
  const password = creds.password;

  if (!email || !password) {
    throw new Error("Missing email or password");
  }

  const isSignup = creds.isSignup === "true";
  const user = await client.user.findUnique({ where: { email } });
  const initialRole = getInitialRoleForEmail(email);

  if (user) {
    if (isSignup) {
      throw new Error("An account already exists for this email");
    }

    const role =
      initialRole === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN"
        ? (
            await client.user.update({
              where: { id: user.id },
              data: { role: "SUPER_ADMIN" },
              select: { role: true },
            })
          ).role
        : user.role;

    if (!user.password) {
      throw new Error("Please sign in with Google");
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new Error("Invalid email or password");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      role,
    };
  }

  if (!isSignup) {
    throw new Error("Invalid email or password");
  }

  if (!validatePasswordPolicy(password).valid) {
    throw new Error(PASSWORD_POLICY_ERROR);
  }

  const hash = await bcrypt.hash(password, 12);
  const newUser = await client.user.create({
    data: { email, password: hash, name: "", avatar: "", role: initialRole },
  });

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name ?? undefined,
    role: newUser.role,
  };
}
