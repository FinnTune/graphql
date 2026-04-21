export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="h-8 w-72 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-4 h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-2 h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  )
}