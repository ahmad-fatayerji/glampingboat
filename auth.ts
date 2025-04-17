// src/lib/auth.ts
import NextAuth from "next-auth"
// import type { AuthOptions }        from "next-auth"
import CredentialsProvider         from "next-auth/providers/credentials"
import GoogleProvider              from "next-auth/providers/google"
import { PrismaAdapter }           from "@auth/prisma-adapter"
import { prisma }                  from "@prisma"
import bcrypt                      from "bcryptjs"

// Derive the correct config type from NextAuth itself:
type AuthOptions = Parameters<typeof NextAuth>[0]

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: { strategy: "jwt" },

  pages: {
    signIn: "/auth/signin",
    error:  "/auth/error",
  },

  providers: [
    // ← DROP the generic here
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // credentials is typed `Record<string, string>` by default
        const email    = credentials?.email as string
        const password = credentials?.password as string
        if (!email || !password) {
          throw new Error("Email and password required")
        }

        let user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
          // Sign‑up: hash & create
          const hashed = await bcrypt.hash(password, 12)
          user = await prisma.user.create({
            data: { email, password: hashed, name: "", avatar: "" }
          })
        } else {
          // Sign‑in: verify
          if (!user.password) {
            throw new Error("No credentials set; please use Google.")
          }
          const ok = await bcrypt.compare(password, user.password)
          if (!ok) throw new Error("Invalid email or password")
        }

        return { id: user.id, email: user.email, name: user.name ?? undefined }
      }
    }),

    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export const { auth, handlers } = handler
export default handlers
