// Operations shared by the server (SSR) and the browser client. `npm run
// codegen` turns these into typed results/variables in generated.ts.
export const EXPLORER_QUERY = /* GraphQL */ `
  fragment CountryFields on Country {
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
    ccn3
  }

  query Explorer($search: String, $region: String, $sortBy: CountrySort) {
    countries(search: $search, region: $region, sortBy: $sortBy) {
      ...CountryFields
    }
    regions
    regionStats {
      region
      countries
      population
    }
    densest: countries(sortBy: DENSITY, limit: 1) {
      ...CountryFields
    }
  }
`
