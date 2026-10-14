'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import Card from '@/app/explore/Card'
import CompareSection from '@/app/explore/CompareSection'
import CountryDetails from '@/app/explore/CountryDetails'
import CountryGrid from '@/app/explore/CountryGrid'
import FilterBar from '@/app/explore/FilterBar'
import KpiCards from '@/app/explore/KpiCards'
import PopulationRankingChart from '@/app/explore/PopulationRankingChart'
import RegionSnapshot from '@/app/explore/RegionSnapshot'
import { useCountryExplorer } from '@/app/explore/useCountryExplorer'
import type { ExplorerData } from '@/lib/graphql-client'
import type { ExplorerUrlState } from '@/lib/url-state'
import {
  countIndependent,
  countWithLanguageData,
  density,
  getDensestCountry,
  getTopPopulationCountries,
  sumPopulation,
} from '@/lib/country-data'

// The world topology is ~750KB of JSON; load it (and d3-geo) only in the
// browser, after the rest of the dashboard has rendered.
const WorldMap = dynamic(() => import('@/app/explore/WorldMap'), {
  ssr: false,
  loading: () => (
    <Card>
      <p className="text-sm text-slate-500 dark:text-slate-400">Loading map...</p>
    </Card>
  ),
})

type ExplorerContentProps = {
  initialState: ExplorerUrlState
  initialData: ExplorerData | null
}

export default function ExplorerContent({ initialState, initialData }: ExplorerContentProps) {
  const explorer = useCountryExplorer({ initialState, initialData })
  const { countries, data } = explorer

  const topPopulationCountries = useMemo(() => getTopPopulationCountries(countries), [countries])
  const densestInFilter = useMemo(() => getDensestCountry(countries), [countries])

  if (explorer.loading) {
    return <div className="py-24 text-lg text-slate-700 dark:text-slate-200">Loading global data...</div>
  }

  if (!data) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-24 text-lg">
        <p className="text-red-600 dark:text-red-400">{explorer.error}</p>
        <button
          type="button"
          onClick={explorer.retry}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
      <header className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-600 to-violet-500 p-6 text-white shadow-lg dark:border-indigo-900">
        <p className="text-xs uppercase tracking-[0.25em] text-indigo-100">Data Playground</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Global Population Explorer</h1>
        <p className="mt-2 max-w-3xl text-indigo-100">
          Explore public country data with search, region filters, interactive comparisons, and dynamic rankings.
        </p>
      </header>

      {explorer.error ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <span>{explorer.error}</span>
          <button type="button" onClick={explorer.retry} className="font-semibold underline">
            Try again
          </button>
        </div>
      ) : null}

      <FilterBar
        query={explorer.query}
        region={explorer.region}
        sortBy={explorer.sortBy}
        regions={data.regions}
        onQueryChange={explorer.setQuery}
        onRegionChange={explorer.setRegion}
        onSortChange={explorer.setSortBy}
      />

      <div
        aria-busy={explorer.fetching}
        className={`flex flex-col gap-6 transition-opacity ${explorer.fetching ? 'opacity-60' : ''}`}
      >
        <KpiCards
          matching={countries.length}
          population={sumPopulation(countries)}
          independent={countIndependent(countries)}
          withLanguages={countWithLanguageData(countries)}
        />

        <WorldMap
          countries={countries}
          selectedCountry={explorer.mapSelection}
          onSelectCountry={explorer.setMapSelection}
        />

        {explorer.mapSelectedCountry ? (
          <Card className="border-indigo-200 p-6 dark:border-indigo-900">
            <CountryDetails country={explorer.mapSelectedCountry} variant="map" />
          </Card>
        ) : null}

        <Card>
          <h2 className="text-xl font-semibold">Top 8 Countries by Population</h2>
          <div className="mt-4">
            <PopulationRankingChart countries={topPopulationCountries} />
          </div>
        </Card>

        <section className="grid gap-4 md:grid-cols-2">
          <RegionSnapshot regionStats={data.regionStats} />
          <Card as="article">
            <h2 className="text-xl font-semibold">Spotlight: Highest Density</h2>
            {data.spotlight ? (
              <div className="mt-4">
                <CountryDetails country={data.spotlight} variant="spotlight" />
              </div>
            ) : (
              <p className="mt-4 text-sm">No spotlight country available.</p>
            )}
          </Card>
        </section>

        <CompareSection
          countries={countries}
          compareA={explorer.compareA}
          compareB={explorer.compareB}
          countryA={explorer.compareCountryA}
          countryB={explorer.compareCountryB}
          onChangeA={explorer.setCompareASelection}
          onChangeB={explorer.setCompareBSelection}
        />

        <CountryGrid countries={countries} />

        <footer className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <p>
            Current densest country in filter:{' '}
            <span className="font-semibold">
              {densestInFilter
                ? `${densestInFilter.name.common} (${density(densestInFilter).toFixed(1)}/km2)`
                : 'N/A'}
            </span>
          </p>
        </footer>
      </div>
    </div>
  )
}
