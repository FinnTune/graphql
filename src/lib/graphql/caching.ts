import type { Plugin } from 'graphql-yoga'

// The dataset only changes when a new snapshot is deployed (and a deploy
// purges CDN caches), so identical GET queries can be shared freely.
export const CACHE_CONTROL = 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400'

/**
 * Marks successful GET query responses as cacheable by browsers and CDNs.
 * POST requests and any response carrying errors are left uncacheable.
 */
export function cachingPlugin(): Plugin {
  const failed = new WeakSet<Request>()

  return {
    onResultProcess({ request, result }) {
      const results = Array.isArray(result) ? result : [result]
      if (results.some((entry) => 'errors' in entry && entry.errors?.length)) {
        failed.add(request)
      }
    },
    onResponse({ request, response }) {
      if (request.method === 'GET' && response.status === 200 && !failed.has(request)) {
        response.headers.set('Cache-Control', CACHE_CONTROL)
      }
    },
  }
}
