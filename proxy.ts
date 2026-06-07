import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export default async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const path = request.nextUrl.pathname

  if (!token && (path.startsWith("/dashboard") || path.startsWith("/admin") || path.startsWith("/petugas"))) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (token && (path === "/auth/login" || path === "/auth/register")) {
    const role = (token as any).role
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    if (role === "PETUGAS") return NextResponse.redirect(new URL("/petugas/dashboard", request.url))
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (path.startsWith("/admin") && (token as any)?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (path.startsWith("/petugas") && !["ADMIN", "PETUGAS"].includes((token as any)?.role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/petugas/:path*", "/auth/login", "/auth/register"]
}
