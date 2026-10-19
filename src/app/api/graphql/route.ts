import { yoga } from '@/lib/graphql/yoga'
import { createRateLimiter, getClientKey } from '@/lib/rate-limit'

export const RATE_LIMIT_PER_MINUTE = 120

const checkRateLimit = createRateLimiter({ limit: RATE_LIMIT_PER_MINUTE, windowMs: 60_000 })

function handler(request: Request) {
  // CORS preflights are cheap and must not be counted against the caller.
  if (request.method !== 'OPTIONS') {
    const { allowed, retryAfterSeconds } = checkRateLimit(getClientKey(request))
    if (!allowed) {
      return Response.json(
        { errors: [{ message: 'Too many requests. Please slow down.' }] },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
      )
    }
  }

  return yoga.handleRequest(request, {})
}

export { handler as GET, handler as POST, handler as OPTIONS }
