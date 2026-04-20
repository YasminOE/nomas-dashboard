import type { NextAuthConfig } from "next-auth"

/**
 * Edge-safe auth options (no Node-only modules). Used by `src/proxy.ts`.
 * Keep DB/bcrypt in `auth.ts` only.
 */
export const authConfig = {
  /** Required on Vercel so cookies / host headers resolve correctly. */
  trustHost: true,
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
        const id = (token.id as string | undefined) ?? (token.sub as string | undefined)
        if (id) session.user.id = id
        if (token.isAdmin !== undefined) {
          session.user.isAdmin = token.isAdmin as boolean
        }
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
