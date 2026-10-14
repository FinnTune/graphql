import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/graphql/route'
import { filterValidCountries } from '@/lib/country-data'
import { loadCountries } from '@/lib/countries-source'
import { EXPLORER_QUERY } from '@/lib/graphql-client'
import { MAX_QUERY_DEPTH, MAX_QUERY_LENGTH } from '@/lib/graphql/security'
import { sampleCountries } from '@/test/fixtures/countries'

const COUNTRIES_QUERY_ALL = `{ countries { name { common } languages } }`

function names(countries: { name: { common: string } }[]) {
  return countries.map((country) => country.name.common)
}

function useCountries(countries = sampleCountries) {
  vi.mocked(loadCountries).mockResolvedValue(filterValidCountries(countries))
}

function postGraphQL(query: string, variables?: Record<string, unknown>) {
  return POST(
    new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    })
  )
}

describe('GraphQL /api/graphql route', () => {
  beforeEach(() => {
    useCountries()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('resolves countries from the countries source', async () => {
    useCountries()

    const response = await postGraphQL(COUNTRIES_QUERY_ALL)
    const json = await response.json()

    expect(json.errors).toBeUndefined()
    expect(json.data.countries).toHaveLength(5)
    expect(json.data.countries.map((c: { name: { common: string } }) => c.name.common)).toEqual(
      expect.arrayContaining(['Japan', 'Monaco', 'United States', 'India', 'Brazil'])
    )
  })

  it('passes through the languages map as JSON', async () => {
    useCountries()

    const response = await postGraphQL(COUNTRIES_QUERY_ALL)
    const json = await response.json()

    const japan = json.data.countries.find(
      (c: { name: { common: string } }) => c.name.common === 'Japan'
    )
    expect(japan.languages).toEqual({ jpn: 'Japanese' })
  })

  it('returns a masked GraphQL error when the countries source fails', async () => {
    vi.mocked(loadCountries).mockRejectedValue(new Error('source offline'))
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const response = await postGraphQL(COUNTRIES_QUERY_ALL)
    const json = await response.json()

    // Yoga masks resolver error details from the client by default; the
    // original error still surfaces server-side via console.error.
    // `countries` is non-nullable, so the error nulls the whole `data` payload.
    expect(json.data).toBeNull()
    expect(json.errors?.[0]?.message).toBe('Unexpected error.')
  })
  it('filters, sorts, and limits server-side via arguments', async () => {
    useCountries()

    const europe = await (
      await postGraphQL(`{ countries(region: "Europe") { name { common } } }`)
    ).json()
    expect(names(europe.data.countries)).toEqual(['Monaco'])

    const search = await (
      await postGraphQL(`{ countries(search: "TOKYO") { name { common } } }`)
    ).json()
    expect(names(search.data.countries)).toEqual(['Japan'])

    const byName = await (
      await postGraphQL(`{ countries(sortBy: NAME, limit: 2) { name { common } } }`)
    ).json()
    expect(names(byName.data.countries)).toEqual(['Brazil', 'India'])

    const densest = await (
      await postGraphQL(`{ countries(sortBy: DENSITY, limit: 1) { name { common } } }`)
    ).json()
    expect(names(densest.data.countries)).toEqual(['Monaco'])
  })

  it('rejects an out-of-range limit', async () => {
    useCountries()

    const json = await (await postGraphQL(`{ countries(limit: 100000) { name { common } } }`)).json()

    expect(json.errors?.[0]?.message).toMatch(/limit must be between/)
  })

  it('exposes regions and per-region stats', async () => {
    useCountries()

    const json = await (
      await postGraphQL(`{ regions regionStats { region countries population } }`)
    ).json()

    expect(json.data.regions).toEqual(['Americas', 'Asia', 'Europe'])
    expect(json.data.regionStats[0]).toMatchObject({ region: 'Asia' })
  })

  it('serves the explorer query in one round trip', async () => {
    useCountries()

    const json = await (await postGraphQL(EXPLORER_QUERY, { region: 'Asia', sortBy: 'NAME' })).json()

    expect(json.errors).toBeUndefined()
    expect(names(json.data.countries)).toEqual(['India', 'Japan'])
    expect(names(json.data.densest)).toEqual(['Monaco'])
  })

  it('rejects queries nested deeper than the depth limit', async () => {
    useCountries()
    // Self-referential fragments aren't possible in this schema, so build
    // depth with a long chain of nested selections on a field that does not
    // exist; validation must still flag the depth before field resolution.
    const nested = Array.from({ length: MAX_QUERY_DEPTH + 1 }).reduce<string>((inner) => `a { ${inner} }`, 'b')

    const json = await (await postGraphQL(`{ ${nested} }`)).json()

    expect(JSON.stringify(json.errors)).toMatch(/depth/i)
  })

  it('rejects oversized queries', async () => {
    const json = await (
      await postGraphQL(`{ countries { name { common } } } # ${'x'.repeat(MAX_QUERY_LENGTH)}`)
    ).json()

    expect(json.errors?.[0]?.message).toMatch(/maximum length/)
  })
})
