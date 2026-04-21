import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Global Population Explorer',
  description: 'Interactive country analytics dashboard built with Next.js.',
}

export default function RootLayout({children,}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      
      <body className={inter.className}>
        <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-10">
          {children}
        </main>
        <footer className="border-t border-slate-200 px-6 py-4 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <p>
            Copyright (C) 2026 Andre J. Teetor. Licensed under GPL-2.0. See the
            LICENSE file for full terms.
          </p>
        </footer>
      </body>
    </html>
  )
}
