// Single source of truth for the API shape. `npm run codegen` reads this file
// (via the /* GraphQL */ tag) to generate the TypeScript types in generated.ts.
export const typeDefs = /* GraphQL */ `
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

  type RegionStats {
    region: String!
    countries: Int!
    population: Float!
  }

  enum CountrySort {
    POPULATION
    DENSITY
    NAME
  }

  type Query {
    """
    Countries with valid population/area/region data. All arguments are
    optional; results default to population-descending.
    """
    countries(
      "Case-insensitive match against the country name or first capital."
      search: String
      "Exact region name (e.g. \\"Europe\\"). Omit or pass \\"All\\" for every region."
      region: String
      sortBy: CountrySort = POPULATION
      "Maximum number of countries to return (1-300)."
      limit: Int
    ): [Country!]!

    "Sorted list of region names present in the data."
    regions: [String!]!

    "Per-region country counts and total population, most populous first."
    regionStats: [RegionStats!]!
  }
`
