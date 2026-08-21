import { createSchema } from 'graphql-yoga'
import { GraphQLScalarType, Kind } from 'graphql'
import { REST_COUNTRIES_URL, filterValidCountries } from '@/lib/country-data'

const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'Arbitrary JSON value (used for the free-form languages map).',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (node) => {
    if (node.kind === Kind.STRING) return node.value
    return null
  },
})

const typeDefs = /* GraphQL */ `
  scalar JSON

  type CountryName {
    common: String!
  }

  type Flags {
    png: String
  }

  type Country {
    name: CountryName!
    population: Float!
    area: Float!
    region: String!
    subregion: String
    capital: [String!]
    flags: Flags
    timezones: [String!]
    languages: JSON
    independent: Boolean
    ccn3: String
  }

  type Query {
    """
    All countries with valid population/area/region data, sourced live
    from the REST Countries API and normalized server-side.
    """
    countries: [Country!]!
  }
`

async function fetchCountries() {
  const response = await fetch(REST_COUNTRIES_URL)
  if (!response.ok) {
    throw new Error(`REST Countries request failed with status ${response.status}`)
  }

  const json = await response.json()
  return filterValidCountries(json)
}

export const schema = createSchema({
  typeDefs,
  resolvers: {
    JSON: JSONScalar,
    Query: {
      countries: () => fetchCountries(),
    },
  },
})
