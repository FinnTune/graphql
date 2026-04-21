# Global Population Explorer

An interactive data dashboard built with Next.js and TypeScript.

This project originally started as a GraphQL school profile assignment, but it was redesigned to work with public data after the original private source became unavailable. The app now uses live country data and focuses on practical exploration features.

## Features

- Live fetch from the REST Countries API
- Search by country or capital
- Filter by region
- Sort by population, density, or name
- KPI cards that react to active filters
- Top population ranking with SVG bars
- Region snapshot summary
- Spotlight card for the highest-density country
- Side-by-side country comparison with visual index bars
- Country explorer cards with language, timezone, and capital info

## Tech Stack

- Next.js 13 (App Router)
- React 18
- TypeScript
- Tailwind CSS

## Data Source

- REST Countries API: [https://restcountries.com/](https://restcountries.com/)

The dashboard currently requests:

- `name`
- `population`
- `area`
- `region`
- `subregion`
- `capital`
- `flags`
- `timezones`
- `languages`
- `independent`

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3) Run lint

```bash
npm run lint
```

## Project Structure

- `src/app/page.tsx` - Landing page
- `src/app/profile/page.tsx` - Main interactive dashboard
- `src/app/profile/layout.tsx` - Dashboard layout/header
- `src/app/about/page.tsx` - Product-focused about page
- `src/app/about/error.tsx` - Route-level error UI
- `src/app/about/loading.tsx` - Route-level loading UI

## UX Goals

- Make global data exploration immediate and useful
- Keep controls simple but expressive
- Provide meaningful visual comparison at a glance
- Stay accessible and responsive across screen sizes

## Roadmap Ideas

- Add continent map view with selectable markers
- Add trend/history mode using another open dataset
- Add bookmarking/favorites with local storage
- Add export (CSV/JSON) for filtered result sets
- Add test coverage for core data transformations

## Notes

- This repository still uses the original project name (`graphql`) for compatibility with existing setup and scripts.
- The app no longer depends on private auth/JWT flows.

## Copyright and License

Copyright (C) 2026 Andre J. Teetor

This project is licensed under GNU GPL v2.0. See `LICENSE` for details.