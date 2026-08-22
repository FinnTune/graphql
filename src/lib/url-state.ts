import type { SortOption } from '@/lib/country-data'

const SORT_OPTIONS: SortOption[] = ['population', 'density', 'name']

export type ProfileUrlState = {
  query: string
  region: string
  sortBy: SortOption
  compareA: string
  compareB: string
}

export const PROFILE_URL_DEFAULTS: ProfileUrlState = {
  query: '',
  region: 'All',
  sortBy: 'population',
  compareA: '',
  compareB: '',
}

function isSortOption(value: string | null): value is SortOption {
  return SORT_OPTIONS.includes(value as SortOption)
}

export function parseProfileSearchParams(params: URLSearchParams): ProfileUrlState {
  const sortParam = params.get('sort')

  return {
    query: params.get('q') ?? PROFILE_URL_DEFAULTS.query,
    region: params.get('region') ?? PROFILE_URL_DEFAULTS.region,
    sortBy: isSortOption(sortParam) ? sortParam : PROFILE_URL_DEFAULTS.sortBy,
    compareA: params.get('a') ?? PROFILE_URL_DEFAULTS.compareA,
    compareB: params.get('b') ?? PROFILE_URL_DEFAULTS.compareB,
  }
}

export function buildProfileSearchParams(state: ProfileUrlState): URLSearchParams {
  const params = new URLSearchParams()

  if (state.query) params.set('q', state.query)
  if (state.region !== PROFILE_URL_DEFAULTS.region) params.set('region', state.region)
  if (state.sortBy !== PROFILE_URL_DEFAULTS.sortBy) params.set('sort', state.sortBy)
  if (state.compareA) params.set('a', state.compareA)
  if (state.compareB) params.set('b', state.compareB)

  return params
}
