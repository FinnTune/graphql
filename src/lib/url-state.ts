import type { SortOption } from '@/lib/country-data'

const SORT_OPTIONS: SortOption[] = ['population', 'density', 'name']

export type ExplorerUrlState = {
  query: string
  region: string
  sortBy: SortOption
  compareA: string
  compareB: string
}

export const EXPLORER_URL_DEFAULTS: ExplorerUrlState = {
  query: '',
  region: 'All',
  sortBy: 'population',
  compareA: '',
  compareB: '',
}

function isSortOption(value: string | null): value is SortOption {
  return SORT_OPTIONS.includes(value as SortOption)
}

export function parseExplorerSearchParams(params: URLSearchParams): ExplorerUrlState {
  const sortParam = params.get('sort')

  return {
    query: params.get('q') ?? EXPLORER_URL_DEFAULTS.query,
    region: params.get('region') ?? EXPLORER_URL_DEFAULTS.region,
    sortBy: isSortOption(sortParam) ? sortParam : EXPLORER_URL_DEFAULTS.sortBy,
    compareA: params.get('a') ?? EXPLORER_URL_DEFAULTS.compareA,
    compareB: params.get('b') ?? EXPLORER_URL_DEFAULTS.compareB,
  }
}

export function buildExplorerSearchParams(state: ExplorerUrlState): URLSearchParams {
  const params = new URLSearchParams()

  if (state.query) params.set('q', state.query)
  if (state.region !== EXPLORER_URL_DEFAULTS.region) params.set('region', state.region)
  if (state.sortBy !== EXPLORER_URL_DEFAULTS.sortBy) params.set('sort', state.sortBy)
  if (state.compareA) params.set('a', state.compareA)
  if (state.compareB) params.set('b', state.compareB)

  return params
}
