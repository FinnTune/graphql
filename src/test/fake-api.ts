import { vi } from 'vitest'
import { filterValidCountries, type Country } from '@/lib/country-data'
import { loadCountries } from '@/lib/countries-source'
import { GRAPHQL_ENDPOINT } from '@/lib/graphql-client'
import { yoga } from '@/lib/graphql/yoga'
import { sampleCountries } from '@/test/fixtures/countries'

/**
 * Points the countries source at fixtures and stubs global fetch so the
 * browser client's /api/graphql calls are answered by the real GraphQL server
 * in-process. Returns the fetch mock so tests can inspect the calls.
 */
export function installFakeApi(countries: Country[] = sampleCountries) {
  vi.mocked(loadCountries).mockResolvedValue(filterValidCountries(countries))

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)

    if (url === GRAPHQL_ENDPOINT) {
      const response = await yoga.fetch(`http://localhost${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: String(init?.body),
      })
      const payload = await response.json()
      return { ok: response.ok, status: response.status, json: async () => payload } as Response
    }

    throw new Error(`Unexpected fetch: ${url}`)
  })

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

export function graphqlCalls(fetchMock: ReturnType<typeof installFakeApi>) {
  return fetchMock.mock.calls.filter(([url]) => String(url) === GRAPHQL_ENDPOINT)
}
