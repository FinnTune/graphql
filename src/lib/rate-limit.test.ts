import { describe, expect, it } from 'vitest'
import { createRateLimiter, getClientKey } from '@/lib/rate-limit'

describe('createRateLimiter', () => {
  it('allows up to the limit, then blocks until the window resets', () => {
    let time = 0
    const check = createRateLimiter({ limit: 2, windowMs: 1000, now: () => time })

    expect(check('a').allowed).toBe(true)
    expect(check('a').allowed).toBe(true)
    const blocked = check('a')
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBe(1)

    time = 1000
    expect(check('a').allowed).toBe(true)
  })

  it('tracks keys independently', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1000 })

    expect(check('a').allowed).toBe(true)
    expect(check('b').allowed).toBe(true)
    expect(check('a').allowed).toBe(false)
  })

  it('bounds memory by evicting when too many keys are tracked', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 2 })

    check('a')
    check('b')
    check('c') // over capacity: state is reset rather than growing

    expect(check('a').allowed).toBe(true)
  })
})

describe('getClientKey', () => {
  const requestWith = (headers: Record<string, string>) => new Request('http://localhost', { headers })

  it('prefers the Netlify connection IP, then the first X-Forwarded-For entry', () => {
    expect(
      getClientKey(requestWith({ 'x-nf-client-connection-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' })),
    ).toBe('1.1.1.1')
    expect(getClientKey(requestWith({ 'x-forwarded-for': '2.2.2.2, 3.3.3.3' }))).toBe('2.2.2.2')
  })

  it('falls back to a shared key when no proxy headers are present', () => {
    expect(getClientKey(requestWith({}))).toBe('unknown')
  })
})
