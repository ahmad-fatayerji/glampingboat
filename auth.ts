import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1) Make sure we actually received credentials
        if (!credentials) {
          throw new Error("No credentials provided")
        }

        const { email, password } = credentials

        // 2) Explicitly check they're strings
        if (typeof email !== "string" || typeof password !== "string") {
          throw new Error("Invalid credentials format")
        }

        // 3) Find the user in the database
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true, // Explicitly select the password field
          },
        })
        if (!user || typeof user.password !== "string") {
          throw new Error("Invalid email or password")
        }

        // 4) Now both `password` and `user.password` are `string`
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
          throw new Error("Invalid email or password")
        }

        // 5) Return the user object (NextAuth puts this into the JWT)
        return {
          id:    user.id,
          email: user.email,
          name:  user.name ?? undefined,
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
