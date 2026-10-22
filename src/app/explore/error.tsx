'use client' // Error components must be Client Components

import { useEffect } from 'react'

export default function ExploreError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // The server already logged this with its digest; this is for the
    // browser console (and a client-side error tracker, if one is added).
    console.error(error)
  }, [error])

  return (
    <div
      role="alert"
      className="mx-auto w-full max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
    >
      <h2 className="text-xl font-semibold">The explorer failed to load</h2>
      <p className="mt-2 text-sm">{error.message || 'Unexpected error'}</p>
      {error.digest ? <p className="mt-1 text-xs opacity-70">Reference: {error.digest}</p> : null}
      <button
        type="button"
        className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
        onClick={() => reset()}
      >
        Retry
      </button>
    </div>
  )
}
