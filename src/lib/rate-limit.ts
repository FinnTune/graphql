type Entry = { count: number; resetAt: number }

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number }

/**
 * Fixed-window, in-memory rate limiter keyed by an arbitrary string (here:
 * client IP). State is per server instance, so on serverless platforms the
 * effective limit is per warm instance - good enough to blunt abuse of a
 * public endpoint, not a substitute for an edge/WAF rule.
 */
export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
  now = Date.now,
}: {
  limit: number
  windowMs: number
  maxKeys?: number
  now?: () => number
}) {
  const entries = new Map<string, Entry>()

  function sweep(current: number) {
    for (const [key, entry] of entries) {
      if (entry.resetAt <= current) entries.delete(key)
    }
  }

  return function check(key: string): RateLimitResult {
    const current = now()
    let entry = entries.get(key)

    if (!entry || entry.resetAt <= current) {
      // Bound memory: drop expired windows before tracking a new key, and
      // refuse to grow past maxKeys even if every window is still live.
      if (entries.size >= maxKeys) sweep(current)
      if (entries.size >= maxKeys) entries.clear()
      entry = { count: 0, resetAt: current + windowMs }
      entries.set(key, entry)
    }

    entry.count += 1
    return {
      allowed: entry.count <= limit,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - current) / 1000)),
    }
  }
}

/** Best-effort client identifier from proxy headers (Netlify, Vercel, generic). */
export function getClientKey(request: Request): string {
  const forwarded = request.headers.get('x-nf-client-connection-ip') ?? request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || 'unknown'
}
