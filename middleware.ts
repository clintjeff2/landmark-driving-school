import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the pathname from the URL
  const { pathname } = req.nextUrl

  // If no session and trying to access protected routes, redirect to login
  if (
    !session &&
    (pathname.startsWith("/student") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/instructor") ||
      pathname.startsWith("/accountant"))
  ) {
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If we have a session, check role-based access
  if (session) {
    // Get user role from database
    const { data: userData, error } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (error || !userData) {
      // If error fetching role, redirect to login
      const redirectUrl = new URL("/login", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    const { role } = userData

    // Check if user is trying to access a route they don't have permission for
    if (
      (pathname.startsWith("/admin") && role !== "admin") ||
      (pathname.startsWith("/student") && role !== "student") ||
      (pathname.startsWith("/instructor") && role !== "instructor") ||
      (pathname.startsWith("/accountant") && role !== "accountant")
    ) {
      // Redirect to their appropriate dashboard
      let redirectPath = "/"

      switch (role) {
        case "admin":
          redirectPath = "/admin/dashboard"
          break
        case "student":
          redirectPath = "/student/dashboard"
          break
        case "instructor":
          redirectPath = "/instructor/dashboard"
          break
        case "accountant":
          redirectPath = "/accountant/dashboard"
          break
      }

      const redirectUrl = new URL(redirectPath, req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ["/student/:path*", "/admin/:path*", "/instructor/:path*", "/accountant/:path*"],
}
