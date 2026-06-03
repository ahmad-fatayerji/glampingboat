import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getString, isRecord } from "@/lib/type-guards";
import bcrypt from "bcryptjs";

function readGoogleProfile(profile: unknown) {
  if (!isRecord(profile)) {
    return {};
  }

  return {
    email: getString(profile, "email"),
    name: getString(profile, "name"),
    picture: getString(profile, "picture"),
    firstName: getString(profile, "given_name"),
    lastName: getString(profile, "family_name"),
  };
}

async function getUserAuthFieldsByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });
}

async function getUserRoleById(id: string): Promise<UserRole> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });

  return user?.role ?? "CUSTOMER";
}

function getInitialRoleForEmail(email: string): UserRole {
  const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return superAdminEmails.includes(email.toLowerCase())
    ? "SUPER_ADMIN"
    : "CUSTOMER";
}

export function isGoogleAuthEnabled() {
  if (process.env.ENABLE_GOOGLE_AUTH === "false") {
    return false;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  return Boolean(
    clientId &&
      clientSecret &&
      !clientId.includes("your-google-client-id") &&
      !clientSecret.includes("your-google-client-secret")
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/account",
    error: "/account",
  },
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (
          !creds ||
          typeof creds.email !== "string" ||
          typeof creds.password !== "string"
        ) {
          throw new Error("Missing email or password");
        }

        const { email, password } = creds;
        const user = await prisma.user.findUnique({ where: { email } });
        const initialRole = getInitialRoleForEmail(email);

        if (user) {
          const role =
            initialRole === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN"
              ? (
                  await prisma.user.update({
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

        const hash = await bcrypt.hash(password, 12);
        const newUser = await prisma.user.create({
          data: { email, password: hash, name: "", avatar: "", role: initialRole },
        });

        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name ?? undefined,
          role: newUser.role,
        };
      },
    }),
    ...(isGoogleAuthEnabled()
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const googleProfile = readGoogleProfile(profile);
        if (!googleProfile.email) {
          throw new Error("No email from Google");
        }

        await prisma.user.upsert({
          where: { email: googleProfile.email },
          create: {
            email: googleProfile.email,
            name: googleProfile.name ?? "",
            avatar: googleProfile.picture ?? "",
            firstName: googleProfile.firstName,
            lastName: googleProfile.lastName,
            role: getInitialRoleForEmail(googleProfile.email),
          },
          update: {
            name: googleProfile.name ?? "",
            avatar: googleProfile.picture ?? "",
            firstName: googleProfile.firstName,
            lastName: googleProfile.lastName,
            ...(getInitialRoleForEmail(googleProfile.email) === "SUPER_ADMIN"
              ? { role: "SUPER_ADMIN" as const }
              : {}),
          },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        if (user.email) {
          const authFields = await getUserAuthFieldsByEmail(user.email);
          token.id = authFields?.id ?? user.id;
          token.role = authFields?.role ?? user.role ?? "CUSTOMER";
        } else {
          token.id = user.id;
          token.role = user.role ?? "CUSTOMER";
        }
      } else if (!token.id && typeof token.email === "string") {
        const authFields = await getUserAuthFieldsByEmail(token.email);
        token.id = authFields?.id;
        token.role = authFields?.role ?? "CUSTOMER";
      } else if (typeof token.id === "string" && !token.role) {
        token.role = await getUserRoleById(token.id);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
        session.user.role = token.role ?? "CUSTOMER";
      }

      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
