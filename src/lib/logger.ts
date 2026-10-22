type LogContext = Record<string, unknown>

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack }
  }
  return { message: String(error) }
}

/**
 * Logs one structured JSON line per server-side error, which log platforms
 * (Netlify, Datadog, CloudWatch...) can index and alert on.
 *
 * This is the single place errors leave the app. To add an error tracker
 * such as Sentry, forward from here and every call site is covered.
 */
export function logError(message: string, error: unknown, context: LogContext = {}) {
  console.error(
    JSON.stringify({
      level: 'error',
      time: new Date().toISOString(),
      message,
      ...context,
      error: serializeError(error),
    }),
  )
}
