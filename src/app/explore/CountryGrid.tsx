import Image from 'next/image'
import { density, formatLanguageList, formatNumber, type Country } from '@/lib/country-data'
import Card from '@/app/explore/Card'

const GRID_LIMIT = 18

export default function CountryGrid({ countries }: { countries: Country[] }) {
  return (
    <Card>
      <h2 className="text-xl font-semibold">Country Explorer</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Quick look at the first {GRID_LIMIT} countries from your current filter and sort.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {countries.slice(0, GRID_LIMIT).map((country) => (
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
    </Card>
  )
}
