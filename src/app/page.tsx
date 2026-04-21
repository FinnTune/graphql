'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 py-20 text-center">
      <Image
        src="/GraphQL_Logo.svg.png"
        alt="GraphQL Logo"
        width={180}
        height={37}
        priority
      />

      <h1 className="text-4xl font-bold tracking-tight">World Explorer Dashboard</h1>
      <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-300">
        The original private data source is no longer available, so this project now
        uses live public country data to power an interactive profile-style dashboard.
      </p>

      <div className="flex gap-4">
        <Link
          href="/profile"
          className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500"
        >
          Open Dashboard
        </Link>
        <Link
          href="/about"
          className="rounded-lg border border-slate-300 px-5 py-3 font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          About
        </Link>
      </div>
    </div>
  )
}
