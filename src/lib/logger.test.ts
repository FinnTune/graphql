import { afterEach, describe, expect, it, vi } from 'vitest'
import { logError } from '@/lib/logger'

describe('logError', () => {
  afterEach(() => vi.restoreAllMocks())

  it('writes one JSON line with the message, context, and serialized error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    logError('Something broke', new TypeError('bad input'), { path: '/explore' })

    expect(spy).toHaveBeenCalledOnce()
    const entry = JSON.parse(String(spy.mock.calls[0][0]))
    expect(entry).toMatchObject({
      level: 'error',
      message: 'Something broke',
      path: '/explore',
      error: { name: 'TypeError', message: 'bad input' },
    })
    expect(entry.error.stack).toContain('TypeError')
    expect(new Date(entry.time).toString()).not.toBe('Invalid Date')
  })

  it('handles thrown non-Error values', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    logError('Odd throw', 'just a string')

    expect(JSON.parse(String(spy.mock.calls[0][0])).error).toEqual({ message: 'just a string' })
  })
})
