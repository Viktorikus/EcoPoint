import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// In-memory store for rate limiting (for demo/academic purposes)
const rateLimit = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string, path: string) {
  const now = Date.now()
  const isAuth = path.startsWith("/api/auth/register") || path.startsWith("/api/auth/signin")
  const limit = isAuth ? 5 : 60
  const windowMs = isAuth ? 15 * 60 * 1000 : 60 * 1000 // 15 mins for auth, 1 min for others

  const key = `${ip}:${isAuth ? 'auth' : 'api'}`
  const record = rateLimit.get(key)

  if (!record || now > record.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, limit, remaining: limit - 1, retryAfter: 0 }
  }

  if (record.count >= limit) {
    return { allowed: false, limit, remaining: 0, retryAfter: Math.ceil((record.resetAt - now) / 1000) }
  }

  record.count++
  return { allowed: true, limit, remaining: limit - record.count, retryAfter: 0 }
}

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Step 1: Rate limiting (only for API routes)
  if (path.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1"
    const rl = checkRateLimit(ip, path)

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests", retryAfter: rl.retryAfter },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": rl.limit.toString(),
            "X-RateLimit-Remaining": rl.remaining.toString(),
            "Retry-After": rl.retryAfter.toString()
          }
        }
      )
    }
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  let response: NextResponse | undefined;

  // Step 2: API route protection (RBAC)
  if (path.startsWith("/api/")) {
    const isPublicApi = path.startsWith("/api/auth/") || path.startsWith("/api/leaderboard")
    
    if (!isPublicApi) {
      if (!token) {
        response = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      } else {
        const role = (token as any).role
        if (path.startsWith("/api/admin/") && role !== "ADMIN") {
          response = NextResponse.json({ error: "Forbidden" }, { status: 403 })
        } else if (path.startsWith("/api/petugas/") && !["ADMIN", "PETUGAS"].includes(role)) {
          response = NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      }
    }
  }

  // Step 3: Page route logic from existing proxy.ts
  if (!response) {
    if (!token && (path.startsWith("/dashboard") || path.startsWith("/admin") || path.startsWith("/petugas"))) {
      response = NextResponse.redirect(new URL("/auth/login", request.url))
    } else if (token && (path === "/auth/login" || path === "/auth/register")) {
      const role = (token as any).role
      if (role === "ADMIN") response = NextResponse.redirect(new URL("/admin/dashboard", request.url))
      else if (role === "PETUGAS") response = NextResponse.redirect(new URL("/petugas/dashboard", request.url))
      else response = NextResponse.redirect(new URL("/dashboard", request.url))
    } else if (path.startsWith("/admin") && (token as any)?.role !== "ADMIN") {
      response = NextResponse.redirect(new URL("/dashboard", request.url))
    } else if (path.startsWith("/petugas") && !["ADMIN", "PETUGAS"].includes((token as any)?.role)) {
      response = NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      response = NextResponse.next()
    }
  }

  // C: Security headers for all responses
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // Also include rate limit headers if it's an API request
  if (path.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1"
    const key = `${ip}:${path.startsWith("/api/auth/") ? 'auth' : 'api'}`
    const record = rateLimit.get(key)
    if (record) {
      const isAuth = path.startsWith("/api/auth/register") || path.startsWith("/api/auth/signin")
      const limit = isAuth ? 5 : 60
      response.headers.set("X-RateLimit-Limit", limit.toString())
      response.headers.set("X-RateLimit-Remaining", Math.max(0, limit - record.count).toString())
    }
  }

  return response
}

export const config = {
  matcher: [
    "/api/:path*", 
    "/dashboard/:path*", 
    "/admin/:path*", 
    "/petugas/:path*", 
    "/auth/login", 
    "/auth/register"
  ]
}
