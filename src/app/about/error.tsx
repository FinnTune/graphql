'use client' // Error components must be Client Components
 
import { useEffect } from 'react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
      <h2 className="text-xl font-semibold">About page failed to load</h2>
      <p className="mt-2 text-sm">{error.message || 'Unexpected error'}</p>
      <button
        className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
        onClick={
          () => reset()
        }
      >
        Retry
      </button>
    </div>
  )
}