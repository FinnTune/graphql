import type { Country, RegionStats, SortOption } from '@/lib/country-data'
import { EXPLORER_QUERY } from '@/lib/graphql/documents'
import type { ExplorerQuery, ExplorerQueryVariables } from '@/lib/graphql/operations'

export const GRAPHQL_ENDPOINT = '/api/graphql'

export { EXPLORER_QUERY }

export type ExplorerData = {
  /** Countries matching the active filter, already sorted by the server. */
  countries: Country[]
  /** Region options for the filter dropdown, including the "All" entry. */
  regions: string[]
  regionStats: RegionStats[]
  /** Densest country across the whole dataset, regardless of filter. */
  spotlight: Country | null
}

type GraphQLResponse<T> = {
  data?: T
  errors?: { message: string }[]
}

export function toExplorerData(result: ExplorerQuery): ExplorerData {
  return {
    countries: result.countries,
    regions: ['All', ...result.regions],
    regionStats: result.regionStats,
    spotlight: result.densest[0] ?? null,
  }
}

const SORT_TO_ENUM: Record<SortOption, NonNullable<ExplorerQueryVariables['sortBy']>> = {
  population: 'POPULATION',
  density: 'DENSITY',
  name: 'NAME',
}

export function toExplorerVariables(state: {
  query: string
  region: string
  sortBy: SortOption
}): ExplorerQueryVariables {
  return { search: state.query, region: state.region, sortBy: SORT_TO_ENUM[state.sortBy] }
}

export async function fetchExplorerData(
  variables: ExplorerQueryVariables,
  signal?: AbortSignal
): Promise<ExplorerData> {
  // GET (not POST) so identical filter views share one CDN/browser-cached
  // response; the server marks successful GET results as cacheable.
  const params = new URLSearchParams({ query: EXPLORER_QUERY, variables: JSON.stringify(variables) })
  const response = await fetch(`${GRAPHQL_ENDPOINT}?${params}`, { signal })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const json = (await response.json()) as GraphQLResponse<ExplorerQuery>

  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? 'GraphQL request failed')
  }
  if (!json.data) {
    throw new Error('GraphQL response contained no data')
  }

  return toExplorerData(json.data)
}
