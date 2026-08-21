import type { Country } from '@/lib/country-data'

export const GRAPHQL_ENDPOINT = '/api/graphql'

export const COUNTRIES_QUERY = /* GraphQL */ `
  query Countries {
    countries {
      name {
        common
      }
      population
      area
      region
      subregion
      capital
      flags {
        png
      }
      timezones
      languages
      independent
    }
  }
`

type GraphQLResponse<T> = {
  data?: T
  errors?: { message: string }[]
}

export async function fetchCountriesViaGraphQL(): Promise<Country[]> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: COUNTRIES_QUERY }),
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const json = (await response.json()) as GraphQLResponse<{ countries: Country[] }>

  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? 'GraphQL request failed')
  }

  return json.data?.countries ?? []
}
