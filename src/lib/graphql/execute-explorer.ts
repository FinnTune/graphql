import type { ExplorerQuery, ExplorerQueryVariables } from '@/lib/graphql/operations'
import { EXPLORER_QUERY } from '@/lib/graphql/documents'
import { GRAPHQL_PATH, yoga } from '@/lib/graphql/yoga'
import { toExplorerData, type ExplorerData } from '@/lib/graphql-client'

/**
 * Runs the explorer query against the in-process GraphQL server (no network
 * hop) so the first page load can be server-rendered with real data. Going
 * through Yoga's fetch interface means the same validation and security
 * rules apply as for browser requests.
 */
export async function loadExplorerData(variables: ExplorerQueryVariables): Promise<ExplorerData> {
  const response = await yoga.fetch(`http://localhost${GRAPHQL_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: EXPLORER_QUERY, variables }),
  })
  const result = (await response.json()) as {
    data?: ExplorerQuery
    errors?: { message: string }[]
  }

  if (result.errors?.length || !result.data) {
    throw new Error(result.errors?.[0]?.message ?? 'Explorer query returned no data')
  }

  return toExplorerData(result.data)
}
