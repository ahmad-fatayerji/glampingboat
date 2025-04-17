// src/lib/auth.ts
import NextAuth from "next-auth"
import type { NextAuthConfig }     from "next-auth"                 // v5 renamed type :contentReference[oaicite:3]{index=3}
import type { Adapter }            from "next-auth/adapters"        // for casting
import CredentialsProvider         from "next-auth/providers/credentials"
import GoogleProvider              from "next-auth/providers/google"
import { PrismaAdapter }           from "@auth/prisma-adapter"      // v5 Prisma adapter :contentReference[oaicite:4]{index=4}
import { prisma }                  from "@/lib/prisma"
import bcrypt                      from "bcryptjs"

export const authConfig: NextAuthConfig = {
  // Cast to Adapter so TS knows the shape is correct :contentReference[oaicite:5]{index=5}
  adapter: PrismaAdapter(prisma) as Adapter,

  // Use JWT sessions
  session: { strategy: "jwt" },

  // Custom sign‑in & error pages
  pages: {
    signIn: "/auth/signin",
    error:  "/auth/error",
  },

  providers: [
    // —— Email & Password credentials ——
    CredentialsProvider<{
      email:    string
      password: string
    }>({
      name: "Email & Password",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const { email, password } = creds
        if (!email || !password) {
          throw new Error("Email and password required")
        }

        // Try to find an existing user
        let user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
          // First‑time signup → hash & create
          const hashed = await bcrypt.hash(password, 12)
          user = await prisma.user.create({
            data: { email, password: hashed, name: "", avatar: "" }
          })
        } else {
          // Existing user → verify password
          if (!user.password) {
            throw new Error("No credentials set; please sign in with Google.")
          }
          const valid = await bcrypt.compare(password, user.password)
          if (!valid) {
            throw new Error("Invalid email or password")
          }
        }

        // NextAuth only needs id/email/name in the returned object
        return { id: user.id, email: user.email, name: user.name ?? undefined }
      }
    }),

    // —— Google OAuth ——
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // Persist user.id into the JWT
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    // Expose user.id on the session
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    }
  }
}

// NextAuth() returns an object containing both the App‑Router handlers and the universal `auth()` helper :contentReference[oaicite:6]{index=6}
const nextAuth = NextAuth(authConfig)
export const { handlers, auth } = nextAuth
export default handlers
