export type Country = {
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

export type RegionStats = {
  region: string
  countries: number
  population: number
}

export type SortOption = 'population' | 'density' | 'name'

export const REST_COUNTRIES_URL =
  'https://restcountries.com/v3.1/all?fields=name,population,area,region,capital,flags,subregion,timezones,languages,independent'

export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value)
}

export function density(country: Country): number {
  return country.population / country.area
}

export function normalized(value: number, max: number): number {
  if (!max) return 0
  return (value / max) * 100
}

export function populationBarWidth(population: number, maxPopulation: number): number {
  return Math.max(8, (population / maxPopulation) * 100)
}

export function isValidCountry(country: Country): boolean {
  return Boolean(
    country?.name?.common &&
      country.population > 0 &&
      country.area > 0 &&
      country.region
  )
}

export function filterValidCountries(countries: Country[]): Country[] {
  return countries.filter(isValidCountry)
}

export function getRegionOptions(countries: Country[]): string[] {
  const regions = Array.from(new Set(countries.map((country) => country.region).sort()))
  return ['All', ...regions]
}

export function buildRegionStats(countries: Country[]): RegionStats[] {
  const bucket = new Map<string, RegionStats>()

  countries.forEach((country) => {
    const key = country.region
    const existing = bucket.get(key) ?? { region: key, countries: 0, population: 0 }
    existing.countries += 1
    existing.population += country.population
    bucket.set(key, existing)
  })

  return Array.from(bucket.values()).sort((a, b) => b.population - a.population)
}

export function getSpotlightCountry(countries: Country[]): Country | null {
  if (!countries.length) return null
  return [...countries].sort((a, b) => density(b) - density(a))[0]
}

export function matchesCountryQuery(country: Country, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()
  if (normalizedQuery.length === 0) return true

  return (
    country.name.common.toLowerCase().includes(normalizedQuery) ||
    (country.capital?.[0] ?? '').toLowerCase().includes(normalizedQuery)
  )
}

export function matchesRegion(country: Country, selectedRegion: string): boolean {
  return selectedRegion === 'All' || country.region === selectedRegion
}

export function filterCountries(
  countries: Country[],
  query: string,
  selectedRegion: string
): Country[] {
  return countries.filter(
    (country) => matchesRegion(country, selectedRegion) && matchesCountryQuery(country, query)
  )
}

export function sortCountries(countries: Country[], sortBy: SortOption): Country[] {
  return [...countries].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.common.localeCompare(b.name.common)
    }
    if (sortBy === 'density') {
      return density(b) - density(a)
    }
    return b.population - a.population
  })
}

export function filterAndSortCountries(
  countries: Country[],
  query: string,
  selectedRegion: string,
  sortBy: SortOption
): Country[] {
  return sortCountries(filterCountries(countries, query, selectedRegion), sortBy)
}

export function getTopPopulationCountries(countries: Country[], limit = 8): Country[] {
  return [...countries].sort((a, b) => b.population - a.population).slice(0, limit)
}

export function sumPopulation(countries: Country[]): number {
  return countries.reduce((sum, country) => sum + country.population, 0)
}

export function countIndependent(countries: Country[]): number {
  return countries.filter((country) => country.independent).length
}

export function countWithLanguageData(countries: Country[]): number {
  return countries.filter(
    (country) => country.languages && Object.keys(country.languages).length > 0
  ).length
}

export function getDensestCountry(countries: Country[]): Country | null {
  if (!countries.length) return null
  return [...countries].sort((a, b) => density(b) - density(a))[0]
}

export function findCountryByName(countries: Country[], name: string): Country | null {
  return countries.find((country) => country.name.common === name) ?? null
}

export function getComparisonMaxes(countryA: Country | null, countryB: Country | null) {
  return {
    population: Math.max(countryA?.population ?? 0, countryB?.population ?? 0),
    area: Math.max(countryA?.area ?? 0, countryB?.area ?? 0),
    density: Math.max(
      countryA ? density(countryA) : 0,
      countryB ? density(countryB) : 0
    ),
  }
}

export function formatLanguageList(languages: Record<string, string> | undefined, limit = 3): string {
  if (!languages) return 'Unknown'
  return Object.values(languages).slice(0, limit).join(', ')
}

export function defaultCompareSelections(countries: Country[]): { compareA: string; compareB: string } {
  if (!countries.length) {
    return { compareA: '', compareB: '' }
  }

  return {
    compareA: countries[0].name.common,
    compareB: countries[1]?.name.common ?? countries[0].name.common,
  }
}
