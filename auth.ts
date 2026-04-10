import NextAuth, { type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
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

async function getUserIdByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return user?.id;
}

export const authOptions = {
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

        if (user) {
          if (!user.password) {
            throw new Error("Please sign in with Google");
          }

          const ok = await bcrypt.compare(password, user.password);
          if (!ok) {
            throw new Error("Invalid email or password");
          }

          return { id: user.id, email: user.email, name: user.name ?? undefined };
        }

        const hash = await bcrypt.hash(password, 12);
        const newUser = await prisma.user.create({
          data: { email, password: hash, name: "", avatar: "" },
        });

        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name ?? undefined,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
          },
          update: {
            name: googleProfile.name ?? "",
            avatar: googleProfile.picture ?? "",
            firstName: googleProfile.firstName,
            lastName: googleProfile.lastName,
          },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        if (user.email) {
          token.id = (await getUserIdByEmail(user.email)) ?? user.id;
        } else {
          token.id = user.id;
        }
      } else if (!token.id && typeof token.email === "string") {
        token.id = await getUserIdByEmail(token.email);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth } = NextAuth(authOptions);
