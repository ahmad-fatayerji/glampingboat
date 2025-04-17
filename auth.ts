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
    //–– 1) Credentials Provider ––//
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
        const { email, password } = credentials

        // 1a) Look for an existing user
        const existing = await prisma.user.findUnique({ where: { email } })

        // 1b) If they exist, verify the password
        if (existing) {
          if (typeof existing.password !== "string") {
            throw new Error("No password set on this account")
          }
          const ok = await bcrypt.compare(password, existing.password)
          if (!ok) throw new Error("Invalid email or password")

          return { id: existing.id, email: existing.email, name: existing.name ?? undefined }
        }

        // 1c) If they don’t exist, create them
        const hashed = await bcrypt.hash(password, 12)
        const user = await prisma.user.create({
          data: { email, password: hashed, name: "", avatar: "" },
        })
        return { id: user.id, email: user.email, name: user.name ?? undefined }
      },
    }),

    //–– 2) Google OAuth Provider ––//
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // Attach the user.id into the JWT
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    // Expose session.user.id
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
})
