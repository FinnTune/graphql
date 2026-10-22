import type { Metadata } from 'next'
import ExplorerContent from '@/app/explore/ExplorerContent'
import { logError } from '@/lib/logger'
import { loadExplorerData } from '@/lib/graphql/execute-explorer'
import { toExplorerVariables } from '@/lib/graphql-client'
import { parseExplorerSearchParams } from '@/lib/url-state'

export const metadata: Metadata = {
  title: 'Explore | Global Population Explorer',
}

type ExplorePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Explore({ searchParams }: ExplorePageProps) {
  const rawParams = await searchParams
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(rawParams)) {
    const first = Array.isArray(value) ? value[0] : value
    if (first !== undefined) params.set(key, first)
  }

  const initialState = parseExplorerSearchParams(params)

  // Render the first view on the server so there's no loading spinner. If it
  // fails, the client falls back to fetching (and shows a retry on error).
  let initialData = null
  try {
    initialData = await loadExplorerData(toExplorerVariables({ ...initialState, query: initialState.query.trim() }))
  } catch (error) {
    logError('Server-side explorer load failed', error, { path: '/explore' })
  }

  return <ExplorerContent initialState={initialState} initialData={initialData} />
}
