'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

type Country = {
  name: { common: string }
  population: number
  area: number
  region: string
  capital?: string[]
  flags?: { png?: string }
  subregion?: string
  timezones?: string[]
  languages?: Record<string, string>
  independent?: boolean
}

type RegionStats = {
  region: string
  countries: number
  population: number
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value)
}

function density(country: Country): number {
  return country.population / country.area
}

function normalized(value: number, max: number): number {
  if (!max) return 0
  return (value / max) * 100
}

export default function Profile() {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [sortBy, setSortBy] = useState<'population' | 'density' | 'name'>('population')
  const [compareA, setCompareA] = useState('')
  const [compareB, setCompareB] = useState('')

  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await fetch(
          'https://restcountries.com/v3.1/all?fields=name,population,area,region,capital,flags,subregion,timezones,languages,independent'
        )
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const json = (await response.json()) as Country[]
        const filtered = json.filter(
          (country) =>
            country?.name?.common &&
            country.population > 0 &&
            country.area > 0 &&
            country.region
        )
        setCountries(filtered)
      } catch (fetchError) {
        setError('Could not load country data right now. Please try again.')
        console.error(fetchError)
      } finally {
        setLoading(false)
      }
    }

    fetchCountries()
  }, [])

  const regions = useMemo(() => {
    return ['All', ...new Set(countries.map((country) => country.region).sort())]
  }, [countries])

  const regionStats = useMemo<RegionStats[]>(() => {
    const bucket = new Map<string, RegionStats>()

    countries.forEach((country) => {
      const key = country.region
      const existing = bucket.get(key) ?? { region: key, countries: 0, population: 0 }
      existing.countries += 1
      existing.population += country.population
      bucket.set(key, existing)
    })

    return [...bucket.values()].sort((a, b) => b.population - a.population)
  }, [countries])

  const spotlightCountry = useMemo(() => {
    if (!countries.length) return null
    const sortedByDensity = [...countries].sort(
      (a, b) => density(b) - density(a)
    )
    return sortedByDensity[0]
  }, [countries])

  const filteredCountries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const visible = countries.filter((country) => {
      const byRegion = selectedRegion === 'All' || country.region === selectedRegion
      const byQuery =
        normalizedQuery.length === 0 ||
        country.name.common.toLowerCase().includes(normalizedQuery) ||
        (country.capital?.[0] ?? '').toLowerCase().includes(normalizedQuery)
      return byRegion && byQuery
    })

    return visible.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.common.localeCompare(b.name.common)
      }
      if (sortBy === 'density') {
        return density(b) - density(a)
      }
      return b.population - a.population
    })
  }, [countries, query, selectedRegion, sortBy])

  useEffect(() => {
    if (!filteredCountries.length) {
      setCompareA('')
      setCompareB('')
      return
    }
    setCompareA((current) => current || filteredCountries[0].name.common)
    setCompareB((current) => current || filteredCountries[1]?.name.common || filteredCountries[0].name.common)
  }, [filteredCountries])

  const topPopulationCountries = useMemo(() => {
    return [...filteredCountries]
      .sort((a, b) => b.population - a.population)
      .slice(0, 8)
  }, [filteredCountries])

  const maxPopulation = topPopulationCountries[0]?.population ?? 1
  const independentCountries = useMemo(
    () => filteredCountries.filter((country) => country.independent).length,
    [filteredCountries]
  )
  const countriesWithLanguageData = useMemo(
    () => filteredCountries.filter((country) => country.languages && Object.keys(country.languages).length > 0).length,
    [filteredCountries]
  )
  const densestInFilter = useMemo(() => {
    if (!filteredCountries.length) return null
    return [...filteredCountries].sort((a, b) => density(b) - density(a))[0]
  }, [filteredCountries])
  const compareCountryA = useMemo(
    () => filteredCountries.find((country) => country.name.common === compareA) ?? null,
    [filteredCountries, compareA]
  )
  const compareCountryB = useMemo(
    () => filteredCountries.find((country) => country.name.common === compareB) ?? null,
    [filteredCountries, compareB]
  )
  const comparisonMaxPopulation = Math.max(compareCountryA?.population ?? 0, compareCountryB?.population ?? 0)
  const comparisonMaxArea = Math.max(compareCountryA?.area ?? 0, compareCountryB?.area ?? 0)
  const comparisonMaxDensity = Math.max(
    compareCountryA ? density(compareCountryA) : 0,
    compareCountryB ? density(compareCountryB) : 0
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
          onChange={(event) => setSortBy(event.target.value as 'population' | 'density' | 'name')}
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
            {formatNumber(filteredCountries.reduce((sum, country) => sum + country.population, 0))}
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
            const width = Math.max(8, (country.population / maxPopulation) * 100)
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
            onChange={(event) => setCompareA(event.target.value)}
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
            onChange={(event) => setCompareB(event.target.value)}
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
                <article key={country.name.common} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <h3 className="text-lg font-semibold">{country.name.common}</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <p>Population: {formatNumber(country.population)}</p>
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span>Population index</span>
                        <span>{normalized(country.population, comparisonMaxPopulation).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 rounded bg-slate-200 dark:bg-slate-700">
                        <div className={`h-2 rounded ${accent}`} style={{ width: `${normalized(country.population, comparisonMaxPopulation)}%` }} />
                      </div>
                    </div>
                    <p>Area: {formatNumber(Math.round(country.area))} km2</p>
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span>Area index</span>
                        <span>{normalized(country.area, comparisonMaxArea).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 rounded bg-slate-200 dark:bg-slate-700">
                        <div className={`h-2 rounded ${accent}`} style={{ width: `${normalized(country.area, comparisonMaxArea)}%` }} />
                      </div>
                    </div>
                    <p>Density: {density(country).toFixed(1)} / km2</p>
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span>Density index</span>
                        <span>{normalized(density(country), comparisonMaxDensity).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 rounded bg-slate-200 dark:bg-slate-700">
                        <div className={`h-2 rounded ${accent}`} style={{ width: `${normalized(density(country), comparisonMaxDensity)}%` }} />
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
                  Languages:{' '}
                  {country.languages
                    ? Object.values(country.languages).slice(0, 3).join(', ')
                    : 'Unknown'}
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