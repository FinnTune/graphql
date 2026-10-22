import { afterEach, describe, expect, it, vi } from 'vitest'
import { onRequestError } from '@/instrumentation'

describe('onRequestError', () => {
  afterEach(() => vi.restoreAllMocks())

  it('logs unhandled request errors with their route context', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await onRequestError(
      new Error('boom'),
      { path: '/explore?region=Asia', method: 'GET', headers: {} },
      {
        routerKind: 'App Router',
        routePath: '/explore',
        routeType: 'render',
        renderSource: 'react-server-components',
        revalidateReason: undefined,
      },
    )

    expect(JSON.parse(String(spy.mock.calls[0][0]))).toMatchObject({
      message: 'Unhandled request error',
      path: '/explore?region=Asia',
      method: 'GET',
      routePath: '/explore',
      routeType: 'render',
      error: { message: 'boom' },
    })
  })
})
