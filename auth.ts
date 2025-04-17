// auth.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  providers: [
    // — Credentials Provider — //
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing email or password")
        }
        const { email, password } = credentials as { email: string; password: string }

        // 1) Look up existing user
        const existing = await prisma.user.findUnique({ where: { email } })

        if (existing) {
          // 2) Verify password
          if (typeof existing.password !== "string") {
            throw new Error("Please sign in with Google")
          }
          const isValid = await bcrypt.compare(password, existing.password)
          if (!isValid) {
            throw new Error("Invalid email or password")
          }
          return { id: existing.id, email: existing.email, name: existing.name ?? undefined }
        }

        // 3) First‑time signup
        const hash = await bcrypt.hash(password, 12)
        const user = await prisma.user.create({
          data: { email, password: hash, name: "", avatar: "" },
        })
        return { id: user.id, email: user.email, name: user.name ?? undefined }
      },
    }),

    // — Google OAuth Provider — //
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // 0) Upsert Google users on signIn
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        if (!profile?.email) {
          throw new Error("No email from Google")
        }
        await prisma.user.upsert({
          where:  { email: profile.email },
          create: {
            email:  profile.email,
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

    // 1) Attach user.id into the JWT on first login
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },

    // 2) Expose session.user.id to the client
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
})
