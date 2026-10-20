import { useState } from 'react'
import Image from 'next/image'
import { density, formatLanguageList, formatNumber, type Country } from '@/lib/country-data'
import Card from '@/app/explore/Card'

const PAGE_SIZE = 18

export default function CountryGrid({ countries }: { countries: Country[] }) {
  const [paging, setPaging] = useState({ source: countries, visible: PAGE_SIZE })

  // Start over from the first page whenever the filter/sort produces a new
  // list (adjusting state during render, rather than in an effect, avoids a
  // flash of the old page length).
  let visible = paging.visible
  if (paging.source !== countries) {
    visible = PAGE_SIZE
    setPaging({ source: countries, visible })
  }

  const shown = Math.min(visible, countries.length)

  return (
    <Card>
      <h2 className="text-xl font-semibold">Country Explorer</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Browse the countries from your current filter and sort.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {countries.slice(0, visible).map((country) => (
          <article
            key={country.name.common}
            className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
          >
            <div className="flex items-center gap-3">
              {country.flags?.png ? (
                <Image
                  src={country.flags.png}
                  alt={`${country.name.common} flag`}
                  width={40}
                  height={28}
                  className="rounded"
                  unoptimized
                />
              ) : null}
              <div>
                <h3 className="font-semibold">{country.name.common}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {country.region} {country.subregion ? `- ${country.subregion}` : ''}
                </p>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <p>Population: {formatNumber(country.population)}</p>
              <p>Density: {density(country).toFixed(1)}/km2</p>
              <p>Capital: {country.capital?.[0] ?? 'Unknown'}</p>
              <p>Primary TZ: {country.timezones?.[0] ?? 'Unknown'}</p>
              <p className="col-span-2">Languages: {formatLanguageList(country.languages)}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
          Showing {shown} of {countries.length} countries
        </p>
        {shown < countries.length ? (
          <button
            type="button"
            onClick={() => setPaging({ source: countries, visible: visible + PAGE_SIZE })}
            className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-slate-800"
          >
            Show {Math.min(PAGE_SIZE, countries.length - shown)} more
          </button>
        ) : null}
      </div>
    </Card>
  )
}
