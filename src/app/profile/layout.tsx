import Link from 'next/link'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="w-full border-b border-slate-300 bg-white/90 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            World Explorer
          </h2>
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
            Back Home
          </Link>
        </div>
      </div>
      {children}
    </>
  )
}