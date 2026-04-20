import type { NextAuthConfig } from "next-auth"

/**
 * Edge-safe auth options (no Node-only modules). Used by `src/proxy.ts`.
 * Keep DB/bcrypt in `auth.ts` only.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = (user as { isAdmin: boolean }).isAdmin
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
