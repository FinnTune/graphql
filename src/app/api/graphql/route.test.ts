import { afterEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/graphql/route'
import { REST_COUNTRIES_URL } from '@/lib/country-data'
import { COUNTRIES_QUERY } from '@/lib/graphql-client'
import { sampleCountries } from '@/test/fixtures/countries'

function mockRestCountriesResponse(countries = sampleCountries) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => countries,
    })
  )
}

function postGraphQL(query: string) {
  return POST(
    new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
  )
}

describe('GraphQL /api/graphql route', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('resolves countries by fetching and normalizing the REST Countries API', async () => {
    mockRestCountriesResponse()

    const response = await postGraphQL(COUNTRIES_QUERY)
    const json = await response.json()

    expect(fetch).toHaveBeenCalledWith(
      REST_COUNTRIES_URL,
      expect.objectContaining({ next: { revalidate: 60 * 60 * 6 } })
    )
    expect(json.errors).toBeUndefined()
    expect(json.data.countries).toHaveLength(5)
    expect(json.data.countries.map((c: { name: { common: string } }) => c.name.common)).toEqual(
      expect.arrayContaining(['Japan', 'Monaco', 'United States', 'India', 'Brazil'])
    )
  })

  it('passes through the languages map as JSON', async () => {
    mockRestCountriesResponse()

    const response = await postGraphQL(COUNTRIES_QUERY)
    const json = await response.json()

    const japan = json.data.countries.find(
      (c: { name: { common: string } }) => c.name.common === 'Japan'
    )
    expect(japan.languages).toEqual({ jpn: 'Japanese' })
  })

  it('returns a masked GraphQL error when the upstream request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503 })
    )
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const response = await postGraphQL(COUNTRIES_QUERY)
    const json = await response.json()

    // Yoga masks resolver error details from the client by default; the
    // upstream 503 still surfaces server-side via console.error. `countries`
    // is non-nullable, so the error nulls the whole `data` payload.
    expect(json.data).toBeNull()
    expect(json.errors?.[0]?.message).toBe('Unexpected error.')
  })
})
