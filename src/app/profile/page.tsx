'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  REST_COUNTRIES_URL,
  buildRegionStats,
  countIndependent,
  countWithLanguageData,
  resolveCompareSelection,
  density,
  filterAndSortCountries,
  filterValidCountries,
  findCountryByName,
  formatLanguageList,
  formatNumber,
  getComparisonMaxes,
  getDensestCountry,
  getRegionOptions,
  getSpotlightCountry,
  getTopPopulationCountries,
  normalized,
  populationBarWidth,
  sumPopulation,
  type Country,
  type SortOption,
} from '@/lib/country-data'

export default function Profile() {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [sortBy, setSortBy] = useState<SortOption>('population')
  const [compareASelection, setCompareASelection] = useState('')
  const [compareBSelection, setCompareBSelection] = useState('')

  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await fetch(REST_COUNTRIES_URL)
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const json = (await response.json()) as Country[]
        setCountries(filterValidCountries(json))
      } catch (fetchError) {
        setError('Could not load country data right now. Please try again.')
        console.error(fetchError)
      } finally {
        setLoading(false)
      }
    }

    fetchCountries()
  }, [])

  const regions = useMemo(() => getRegionOptions(countries), [countries])
  const regionStats = useMemo(() => buildRegionStats(countries), [countries])
  const spotlightCountry = useMemo(() => getSpotlightCountry(countries), [countries])

  const filteredCountries = useMemo(
    () => filterAndSortCountries(countries, query, selectedRegion, sortBy),
    [countries, query, selectedRegion, sortBy]
  )

  const compareA = useMemo(
    () => resolveCompareSelection(filteredCountries, compareASelection, 'compareA'),
    [filteredCountries, compareASelection]
  )
  const compareB = useMemo(
    () => resolveCompareSelection(filteredCountries, compareBSelection, 'compareB'),
    [filteredCountries, compareBSelection]
  )

  const topPopulationCountries = useMemo(
    () => getTopPopulationCountries(filteredCountries),
    [filteredCountries]
  )

  const maxPopulation = topPopulationCountries[0]?.population ?? 1
  const independentCountries = useMemo(
    () => countIndependent(filteredCountries),
    [filteredCountries]
  )
  const countriesWithLanguageData = useMemo(
    () => countWithLanguageData(filteredCountries),
    [filteredCountries]
  )
  const densestInFilter = useMemo(() => getDensestCountry(filteredCountries), [filteredCountries])
  const compareCountryA = useMemo(
    () => findCountryByName(filteredCountries, compareA),
    [filteredCountries, compareA]
  )
  const compareCountryB = useMemo(
    () => findCountryByName(filteredCountries, compareB),
    [filteredCountries, compareB]
  )
  const comparisonMaxes = useMemo(
    () => getComparisonMaxes(compareCountryA, compareCountryB),
    [compareCountryA, compareCountryB]
  )

  if (loading) {
    return <div className="py-24 text-lg text-slate-700 dark:text-slate-200">Loading global data...</div>
  }

  if (error) {
    return <div className="py-24 text-lg text-red-600">{error}</div>
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

      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-3">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by country or capital..."
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
        <select
          value={selectedRegion}
          onChange={(event) => setSelectedRegion(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortOption)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="population">Sort: Population</option>
          <option value="density">Sort: Density</option>
          <option value="name">Sort: Name</option>
        </select>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-medium text-slate-500">Countries Matching Filter</h2>
          <p className="mt-2 text-3xl font-semibold">{formatNumber(filteredCountries.length)}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-medium text-slate-500">Global Population</h2>
          <p className="mt-2 text-3xl font-semibold">
            {formatNumber(sumPopulation(filteredCountries))}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-medium text-slate-500">Independent States (Filtered)</h2>
          <p className="mt-2 text-2xl font-semibold">{formatNumber(independentCountries)}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-medium text-slate-500">Language Data Coverage</h2>
          <p className="mt-2 text-2xl font-semibold">{formatNumber(countriesWithLanguageData)}</p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Top 8 Countries by Population</h2>
        <div className="mt-4 space-y-3">
          {topPopulationCountries.map((country) => {
            const width = populationBarWidth(country.population, maxPopulation)
            return (
              <div key={country.name.common}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{country.name.common}</span>
                  <span>{formatNumber(country.population)}</span>
                </div>
                <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="h-3 w-full">
                  <rect x="0" y="0" width="100" height="8" rx="2" fill="#dbeafe" />
                  <rect x="0" y="0" width={width} height="8" rx="2" fill="#4f46e5" />
                </svg>
              </div>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold">Region Snapshot</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {regionStats.map((region) => (
              <li key={region.region} className="flex justify-between">
                <span>{region.region}</span>
                <span>
                  {region.countries} countries - {formatNumber(region.population)} people
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold">Spotlight: Highest Density</h2>
          {spotlightCountry ? (
            <div className="mt-4 flex gap-4">
              {spotlightCountry.flags?.png ? (
                <Image
                  src={spotlightCountry.flags.png}
                  alt={`${spotlightCountry.name.common} flag`}
                  className="h-16 w-24 rounded object-cover"
                  width={96}
                  height={64}
                  unoptimized
                />
              ) : null}
              <div className="text-sm">
                <p className="text-lg font-semibold">{spotlightCountry.name.common}</p>
                <p>Region: {spotlightCountry.region}</p>
                <p>Subregion: {spotlightCountry.subregion ?? 'Unknown'}</p>
                <p>Capital: {spotlightCountry.capital?.[0] ?? 'Unknown'}</p>
                <p>
                  Density:{' '}
                  {density(spotlightCountry).toFixed(1)} people/km2
                </p>
                <p>Timezone: {spotlightCountry.timezones?.[0] ?? 'Unknown'}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm">No spotlight country available.</p>
          )}
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Compare Two Countries</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose any two visible countries and compare population, area, and density.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select
            value={compareA}
            onChange={(event) => setCompareASelection(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            {filteredCountries.map((country) => (
              <option key={`a-${country.name.common}`} value={country.name.common}>
                {country.name.common}
              </option>
            ))}
          </select>
          <select
            value={compareB}
            onChange={(event) => setCompareBSelection(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            {filteredCountries.map((country) => (
              <option key={`b-${country.name.common}`} value={country.name.common}>
                {country.name.common}
              </option>
            ))}
          </select>
        </div>
        {compareCountryA && compareCountryB ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[compareCountryA, compareCountryB].map((country, index) => {
              const accent = index === 0 ? 'bg-indigo-500' : 'bg-violet-500'
              return (
                <article key={`compare-${index}-${country.name.common}`} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <h3 className="text-lg font-semibold">{country.name.common}</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <p>Population: {formatNumber(country.population)}</p>
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span>Population index</span>
                        <span>{normalized(country.population, comparisonMaxes.population).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 rounded bg-slate-200 dark:bg-slate-700">
                        <div className={`h-2 rounded ${accent}`} style={{ width: `${normalized(country.population, comparisonMaxes.population)}%` }} />
                      </div>
                    </div>
                    <p>Area: {formatNumber(Math.round(country.area))} km2</p>
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span>Area index</span>
                        <span>{normalized(country.area, comparisonMaxes.area).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 rounded bg-slate-200 dark:bg-slate-700">
                        <div className={`h-2 rounded ${accent}`} style={{ width: `${normalized(country.area, comparisonMaxes.area)}%` }} />
                      </div>
                    </div>
                    <p>Density: {density(country).toFixed(1)} / km2</p>
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span>Density index</span>
                        <span>{normalized(density(country), comparisonMaxes.density).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 rounded bg-slate-200 dark:bg-slate-700">
                        <div className={`h-2 rounded ${accent}`} style={{ width: `${normalized(density(country), comparisonMaxes.density)}%` }} />
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Country Explorer</h2>
        <p className="mt-1 text-sm text-slate-500">
          Quick look at the first 18 countries from your current filter and sort.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {filteredCountries.slice(0, 18).map((country) => (
            <article
              key={country.name.common}
              className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                {country.flags?.png ? (
                  <Image
                    src={country.flags.png}
                    alt={`${country.name.common} flag`}
                    width={40}
                    height={28}
                    className="rounded"
                    unoptimized
                  />
                ) : null}
                <div>
                  <h3 className="font-semibold">{country.name.common}</h3>
                  <p className="text-xs text-slate-500">
                    {country.region} {country.subregion ? `- ${country.subregion}` : ''}
                  </p>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <p>Population: {formatNumber(country.population)}</p>
                <p>Density: {density(country).toFixed(1)}/km2</p>
                <p>Capital: {country.capital?.[0] ?? 'Unknown'}</p>
                <p>Primary TZ: {country.timezones?.[0] ?? 'Unknown'}</p>
                <p className="col-span-2">
                  Languages: {formatLanguageList(country.languages)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <p>
          Current densest country in filter:{' '}
          <span className="font-semibold">
            {densestInFilter ? `${densestInFilter.name.common} (${density(densestInFilter).toFixed(1)}/km2)` : 'N/A'}
          </span>
        </p>
      </footer>
    </div>
  )
}
