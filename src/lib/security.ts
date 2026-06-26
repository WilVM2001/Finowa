import { NextResponse } from "next/server"

export function securityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  return response
}

const WINDOW_MS = 60_000
const MAX_REQUESTS = 60
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
let cleanupStarted = false

export function checkRateLimit(key: string): boolean {
  if (!cleanupStarted) startCleanup()

  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (entry.count >= MAX_REQUESTS) return false

  entry.count++
  return true
}

function startCleanup() {
  cleanupStarted = true
  const timer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key)
    }
  }, 300_000)
  if (typeof timer?.unref === "function") timer.unref()
}
