import { createGraphQLError, createSchema } from 'graphql-yoga'
import { GraphQLScalarType, Kind } from 'graphql'
import {
  buildRegionStats,
  filterAndSortCountries,
  type SortOption,
} from '@/lib/country-data'
import { loadCountries } from '@/lib/countries-source'
import { typeDefs } from '@/lib/graphql/type-defs'

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

export const MAX_COUNTRIES_LIMIT = 300

const SORT_ENUM_TO_OPTION: Record<string, SortOption> = {
  POPULATION: 'population',
  DENSITY: 'density',
  NAME: 'name',
}

type CountriesArgs = {
  search?: string | null
  region?: string | null
  sortBy?: string | null
  limit?: number | null
}

export const schema = createSchema({
  typeDefs,
  resolvers: {
    JSON: JSONScalar,
    Query: {
      countries: async (_root: unknown, args: CountriesArgs) => {
        if (args.limit != null && (args.limit < 1 || args.limit > MAX_COUNTRIES_LIMIT)) {
          throw createGraphQLError(`limit must be between 1 and ${MAX_COUNTRIES_LIMIT}`)
        }

        const countries = await loadCountries()
        const result = filterAndSortCountries(
          countries,
          args.search ?? '',
          args.region ?? 'All',
          SORT_ENUM_TO_OPTION[args.sortBy ?? 'POPULATION'] ?? 'population'
        )
        return args.limit != null ? result.slice(0, args.limit) : result
      },
      regions: async () => {
        const countries = await loadCountries()
        return Array.from(new Set(countries.map((country) => country.region))).sort()
      },
      regionStats: async () => buildRegionStats(await loadCountries()),
    },
  },
})
