# Global Population Explorer

An interactive country-data dashboard built with Next.js, TypeScript, and its own GraphQL API.

The project started as a GraphQL school-profile assignment and was redesigned around public data
after the original private source became unavailable.

## Features

- Search by country or capital, filter by region, sort by population, density, or name
- Filtering, sorting, and search run **server-side** through GraphQL arguments
- Server-rendered first load for any URL, with no loading spinner
- Filter, sort, and compare state lives in the URL, so views are shareable and bookmarkable
- Interactive world map (d3-geo + TopoJSON), lazy-loaded, shaded by population or density
- Top-8 population ranking and side-by-side country comparison (Recharts)
- Region snapshot, density spotlight, and KPI cards that react to the active filter
- Charts and the map have accessible table equivalents; the map is keyboard operable
- Dark mode

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- GraphQL Yoga + `graphql` for the API (`/api/graphql`)
- GraphQL Code Generator for types shared by API and UI
- Recharts, d3-geo, topojson-client
- Vitest + Testing Library (unit/integration), Playwright (end-to-end)

## Getting started

```bash
nvm use            # Node 22+ (see .nvmrc)
npm install
npm run dev        # http://localhost:3000
```

| Script                  | What it does                                              |
| ----------------------- | --------------------------------------------------------- |
| `npm run dev`           | Start the dev server (GraphiQL is available at `/api/graphql`) |
| `npm run build` / `start` | Production build / server                               |
| `npm run lint`          | ESLint                                                    |
| `npm run typecheck`     | `tsc --noEmit`                                            |
| `npm test`              | Vitest unit and integration tests                         |
| `npm run test:coverage` | Same, with a coverage report                              |
| `npm run test:e2e`      | Playwright tests against a production build (`npx playwright install chromium` first) |
| `npm run codegen`       | Regenerate `src/lib/graphql/{schema-types,operations}.ts`  |
| `npm run snapshot`      | Rebuild the bundled country dataset                       |

## Architecture

```
src/lib/graphql/type-defs.ts   schema SDL: the single source of truth
src/lib/graphql/schema.ts      resolvers (filter / sort / limit on the server)
src/lib/graphql/security.ts    query depth + length limits, introspection off in production
src/lib/graphql/documents.ts   the explorer query used by both server and browser
src/lib/graphql/yoga.ts        the Yoga instance shared by the route and server rendering
src/app/explore/page.tsx       server component: runs the query for the URL state
src/app/explore/useCountryExplorer.ts   client state, debounced refetch, URL sync
```

After editing `type-defs.ts` or `documents.ts`, run `npm run codegen` (CI fails if the generated
files are stale).

### Example query

```graphql
{
  countries(region: "Europe", search: "land", sortBy: DENSITY, limit: 5) {
    name { common }
    population
    capital
  }
  regions
  regionStats { region countries population }
}
```

## Data

The app serves a bundled snapshot, `src/data/countries-snapshot.json`, because the keyless REST
Countries v3.1 API it originally used has been retired (v5 requires an API key). The snapshot is
built by `npm run snapshot` from:

- [mledoze/countries](https://github.com/mledoze/countries) (ODbL): names, codes, region, capital, area, languages
- [World Bank SP.POP.TOTL](https://data.worldbank.org/indicator/SP.POP.TOTL) (CC BY 4.0): population
- [countries-and-timezones](https://github.com/manuelmhtr/countries-and-timezones): time zones
- [flagcdn.com](https://flagcdn.com): flag images

Population figures are the World Bank's most recent value, so rerun `npm run snapshot` occasionally.
To use a live API instead, replace `loadCountries()` in `src/lib/countries-source.ts`; nothing else
depends on where the data comes from.

Map geometry: `src/data/world-countries-50m.json` (see its license file).

## License

GPL-2.0, see [LICENSE](LICENSE).
