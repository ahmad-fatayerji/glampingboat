import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const { handlers, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email) throw new Error("No profile email")

      await prisma.user.upsert({
        where: { email: profile.email },
        create: {
          email: profile.email,
          name: profile.name ?? "",
          avatar: profile.picture ?? "",
        },
        update: {
          name: profile.name ?? "",
          avatar: profile.picture ?? "",
        },
      })

      return true
    },

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
