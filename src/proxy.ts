import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

export default NextAuth(authConfig).auth((req) => {
  const { pathname } = req.nextUrl
  // Require a real user id — stale/partial JWTs must not count as logged in (avoids / ↔ /login loops).
  const isLoggedIn = !!req.auth?.user?.id

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isDashboard = pathname === "/" || pathname.startsWith("/projects") || pathname.startsWith("/team")

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
