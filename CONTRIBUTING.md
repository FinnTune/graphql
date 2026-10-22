# Contributing

## Setup

```bash
nvm use                                # Node 22+ (see .nvmrc)
npm install
npx playwright install chromium        # once, for end-to-end tests
npm run dev
```

## Before you open a PR

CI runs all of these; run them locally first:

```bash
npm run lint
npm run typecheck
npm run codegen && git status --short src/lib/graphql   # should show no changes
npm run test:coverage
npm run test:e2e                       # builds the app and runs Playwright
```

## Common tasks

### Change the GraphQL API

1. Edit the schema in `src/lib/graphql/type-defs.ts` and the resolvers in `src/lib/graphql/schema.ts`.
2. If the browser needs new fields, edit the query in `src/lib/graphql/documents.ts`.
3. Run `npm run codegen`. It rewrites `schema-types.ts` and `operations.ts`; commit both. CI fails
   if they are out of date. Never edit them by hand.
4. Add a case to `src/app/api/graphql/route.test.ts`.

### Update the country data

Run `npm run snapshot` and review the diff of `src/data/countries-snapshot.json`. A GitHub Action does
this monthly and opens a PR. To add or correct a figure the sources lack, edit
`POPULATION_OVERRIDES` in `scripts/build-countries-snapshot.mjs` rather than the JSON, which is
regenerated.

### Change what the dashboard shows

- Pure data helpers (filter, sort, stats) live in `src/lib/country-data.ts` and are unit tested.
- UI state, the debounced refetch, and URL syncing live in `src/app/explore/useCountryExplorer.ts`.
- The page itself (`src/app/explore/page.tsx`) is a server component that loads data for the URL.
  Its first render must not need the browser; client-only code belongs in the components.

### Tests

- Unit and component tests sit next to the code (`*.test.ts(x)`). `src/test/fake-api.ts` points the
  countries source at fixtures and serves `/api/graphql` in-process, so component tests exercise the
  real schema.
- End-to-end tests are in `e2e/` and run against the production build, including the hardening that
  only applies in production (introspection off, depth limits, caching headers).
- `e2e/bundle-budget.spec.ts` fails if the initial `/explore` JavaScript exceeds its gzip budget or the
  world map data leaks out of its lazy chunk. Raise the budget deliberately, in the same PR as the
  feature that needs it.

## Errors and logging

Server errors are logged as single-line JSON through `logError` (`src/lib/logger.ts`). That function
is the one place to forward to an error tracker such as Sentry, and it covers GraphQL resolver
errors, unhandled request errors (`src/instrumentation.ts`), and the server-render fallback.

## Conventions

- No semicolons, single quotes, ~110 character lines (match the surrounding code).
- Keep comments for the *why*, not the *what*.
- Keep commits focused, with a message that says why the change was made.
