import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email as string | undefined
          const password = credentials?.password as string | undefined

          if (!email || !password) return null

          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user || !user.password) return null
          if (!user.isActive) return null

          const isValid = await compare(password, user.password)
          if (!isValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            isActive: user.isActive,
          }
        } catch (error) {
          console.error("[authorize]", error instanceof Error ? error.message : error)
          if (error instanceof Error && error.stack) {
            console.error("[authorize] stack:", error.stack.split("\n").slice(0, 4).join("\n"))
          }
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isActive = (user as any).isActive
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
})
