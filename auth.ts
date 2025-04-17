// auth.ts
import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        // 1) Validate input
        if (
          !creds ||
          typeof creds.email    !== "string" ||
          typeof creds.password !== "string"
        ) {
          throw new Error("Missing email or password")
        }
        const { email, password } = creds

        // 2) Look up user
        const user = await prisma.user.findUnique({ where: { email } })
        if (user) {
          // block credential login for OAuth‑only accounts
          if (!user.password) {
            throw new Error("Please sign in with Google")
          }
          // verify password
          const ok = await bcrypt.compare(password, user.password)
          if (!ok) {
            throw new Error("Invalid email or password")
          }
          return { id: user.id, email: user.email, name: user.name ?? undefined }
        }

        // 3) First‑time signup
        const hash = await bcrypt.hash(password, 12)
        const newUser = await prisma.user.create({
          data: { email, password: hash, name: "", avatar: "" },
        })
        return { id: newUser.id, email: newUser.email, name: newUser.name ?? undefined }
      },
    }),

    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // On Google sign‑in, upsert their profile
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const email = profile?.email
        if (!email) throw new Error("No email from Google")
        await prisma.user.upsert({
          where:  { email },
          create: {
            email,
            name:   profile.name ?? "",
            avatar: (profile as any).picture ?? "",
          },
          update: {
            name:   profile.name ?? "",
            avatar: (profile as any).picture ?? "",
          },
        })
      }
      return true
    },

    // Embed user.id into the token
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },

    // Expose user.id on the client session
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
} satisfies NextAuthConfig

// Finally spin up NextAuth and export the two helpers:
export const { handlers, auth } = NextAuth(authOptions)
