export default function About() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <section className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-600 to-violet-500 p-6 text-white shadow-lg dark:border-indigo-900">
        <h1 className="text-3xl font-bold">From School Profile to Global Data Explorer</h1>
        <p className="mt-2 text-indigo-100">
          This app started as a GraphQL student-profile project. It has now evolved into an
          interactive country analytics dashboard powered by public data.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold">What It Does</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>Search countries by name or capital</li>
            <li>Filter and sort by region, population, density, or name</li>
            <li>Compare two countries side-by-side with visual index bars</li>
            <li>Explore regional snapshots and top population rankings</li>
          </ul>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold">Data Source</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Country data is served by this app&apos;s own GraphQL API from a bundled snapshot:
            names, codes, areas and languages from{' '}
            <a
              href="https://github.com/mledoze/countries"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline"
            >
              mledoze/countries
            </a>
            , and population figures from the{' '}
            <a
              href="https://data.worldbank.org/indicator/SP.POP.TOTL"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline"
            >
              World Bank
            </a>
            .
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            The keyless REST Countries API this project originally used has been retired, so the
            snapshot makes the app work for everyone without an API key.
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Why This Version Is More Useful</h2>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          The previous implementation required private credentials and platform-only data.
          This updated version works for anyone immediately, offers richer interactive analysis,
          and acts as a reusable foundation for future public-data exploration features.
        </p>
      </section>
    </div>
  )
}