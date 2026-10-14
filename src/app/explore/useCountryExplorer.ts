'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { fetchExplorerData, toExplorerVariables, type ExplorerData } from '@/lib/graphql-client'
import { buildExplorerSearchParams, type ExplorerUrlState } from '@/lib/url-state'
import {
  findCountryByName,
  resolveCompareSelection,
  type SortOption,
} from '@/lib/country-data'

const SEARCH_DEBOUNCE_MS = 250

const LOAD_ERROR_MESSAGE = 'Could not load country data right now. Please try again.'

function filterKey(state: { query: string; region: string; sortBy: SortOption }) {
  return JSON.stringify([state.query.trim(), state.region, state.sortBy])
}

type UseCountryExplorerArgs = {
  initialState: ExplorerUrlState
  /** Data rendered on the server for `initialState`, or null if that failed. */
  initialData: ExplorerData | null
}

/**
 * Owns all explorer state: the filter controls, the server-filtered data for
 * them (refetched over GraphQL when they change), compare/map selections, and
 * the URL sync that makes the view shareable.
 */
export function useCountryExplorer({ initialState, initialData }: UseCountryExplorerArgs) {
  const router = useRouter()
  const pathname = usePathname()

  const [data, setData] = useState<ExplorerData | null>(initialData)
  const [error, setError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  const [query, setQuery] = useState(initialState.query)
  const [region, setRegion] = useState(initialState.region)
  const [sortBy, setSortBy] = useState<SortOption>(initialState.sortBy)
  const [compareASelection, setCompareASelection] = useState(initialState.compareA)
  const [compareBSelection, setCompareBSelection] = useState(initialState.compareB)
  const [mapSelection, setMapSelection] = useState<string | null>(null)

  // Key of the filter state that `data` currently reflects.
  const [loadedKey, setLoadedKey] = useState<string | null>(() =>
    initialData ? filterKey(initialState) : null
  )
  const handledReload = useRef(0)

  const currentKey = filterKey({ query, region, sortBy })
  const loading = data === null && !error
  const fetching = !error && loadedKey !== currentKey

  useEffect(() => {
    const isRetry = reloadToken !== handledReload.current
    if (!isRetry && loadedKey === currentKey) return

    const controller = new AbortController()
    // Only debounce when the text changed; selects should respond immediately.
    const lastQuery = loadedKey ? (JSON.parse(loadedKey) as string[])[0] : null
    const delay = !isRetry && lastQuery !== null && lastQuery !== query.trim() ? SEARCH_DEBOUNCE_MS : 0

    const timer = setTimeout(async () => {
      handledReload.current = reloadToken
      try {
        const next = await fetchExplorerData(
          toExplorerVariables({ query: query.trim(), region, sortBy }),
          controller.signal
        )
        setData(next)
        setLoadedKey(currentKey)
        setError('')
      } catch (fetchError) {
        if (controller.signal.aborted) return
        console.error(fetchError)
        setError(LOAD_ERROR_MESSAGE)
      }
    }, delay)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [currentKey, loadedKey, query, region, sortBy, reloadToken])

  const retry = useCallback(() => {
    setError('')
    setReloadToken((token) => token + 1)
  }, [])

  const countries = useMemo(() => data?.countries ?? [], [data])

  const compareA = useMemo(
    () => resolveCompareSelection(countries, compareASelection, 'compareA'),
    [countries, compareASelection]
  )
  const compareB = useMemo(
    () => resolveCompareSelection(countries, compareBSelection, 'compareB'),
    [countries, compareBSelection]
  )
  const compareCountryA = useMemo(() => findCountryByName(countries, compareA), [countries, compareA])
  const compareCountryB = useMemo(() => findCountryByName(countries, compareB), [countries, compareB])
  const mapSelectedCountry = useMemo(
    () => (mapSelection ? findCountryByName(countries, mapSelection) : null),
    [countries, mapSelection]
  )

  // Keeps the URL in sync so the current filter/sort/compare state is
  // shareable and bookmarkable. Uses replace (not push) so typing in the
  // search box doesn't spam browser history.
  useEffect(() => {
    // Until data arrives the compare selections can't be resolved, and
    // writing the unresolved ones would clobber what the URL already says.
    if (!data) return

    const params = buildExplorerSearchParams({ query, region, sortBy, compareA, compareB })
    const queryString = params.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }, [data, query, region, sortBy, compareA, compareB, pathname, router])

  return {
    data,
    countries,
    loading,
    fetching,
    error,
    retry,
    query,
    setQuery,
    region,
    setRegion,
    sortBy,
    setSortBy,
    compareA,
    compareB,
    setCompareASelection,
    setCompareBSelection,
    compareCountryA,
    compareCountryB,
    mapSelection,
    setMapSelection,
    mapSelectedCountry,
  }
}
