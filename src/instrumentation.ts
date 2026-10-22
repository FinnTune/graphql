import type { Instrumentation } from 'next'
import { logError } from '@/lib/logger'

// Next.js calls this for every uncaught server error (rendering, route
// handlers), including ones that never reach a React error boundary.
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  logError('Unhandled request error', error, {
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  })
}
