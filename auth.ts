import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { UserRole } from "@/generated/prisma/client";
import { authorizeCredentials } from "@/lib/auth-credentials";
import { prisma } from "@/lib/prisma";
import { getEffectiveRoleForEmail, isSuperAdminEmail } from "@/lib/super-admin";
import { getString, isRecord } from "@/lib/type-guards";

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
    select: { id: true, email: true, role: true },
  });
}

async function getUserRoleById(id: string): Promise<UserRole> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { email: true, role: true },
  });

  return getEffectiveRoleForEmail(user?.email, user?.role);
}

function getInitialRoleForEmail(email: string): UserRole {
  return isSuperAdminEmail(email) ? "SUPER_ADMIN" : "CUSTOMER";
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
        isSignup: { label: "Create account", type: "hidden" },
      },
      async authorize(creds) {
        return authorizeCredentials(creds, prisma, getInitialRoleForEmail);
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
          token.role = getEffectiveRoleForEmail(
            authFields?.email ?? user.email,
            authFields?.role ?? user.role ?? "CUSTOMER"
          );
        } else {
          token.id = user.id;
          token.role = getEffectiveRoleForEmail(
            user.email,
            user.role ?? "CUSTOMER"
          );
        }
      } else if (!token.id && typeof token.email === "string") {
        const authFields = await getUserAuthFieldsByEmail(token.email);
        token.id = authFields?.id;
        token.role = getEffectiveRoleForEmail(
          authFields?.email ?? token.email,
          authFields?.role
        );
      } else if (typeof token.id === "string" && !token.role) {
        token.role = await getUserRoleById(token.id);
      } else if (typeof token.email === "string") {
        token.role = getEffectiveRoleForEmail(token.email, token.role);
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
