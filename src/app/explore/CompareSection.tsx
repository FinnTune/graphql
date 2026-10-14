import ComparisonChart from '@/app/explore/ComparisonChart'
import Card from '@/app/explore/Card'
import { density, formatNumber, type Country } from '@/lib/country-data'

const CONTROL_CLASSES =
  'rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950'

type CompareSectionProps = {
  countries: Country[]
  compareA: string
  compareB: string
  countryA: Country | null
  countryB: Country | null
  onChangeA: (name: string) => void
  onChangeB: (name: string) => void
}

function Summary({ country }: { country: Country }) {
  return (
    <p>
      <span className="font-semibold">{country.name.common}:</span>{' '}
      {formatNumber(country.population)} people · {formatNumber(Math.round(country.area))} km2 ·{' '}
      {density(country).toFixed(1)}/km2
    </p>
  )
}

export default function CompareSection({
  countries,
  compareA,
  compareB,
  countryA,
  countryB,
  onChangeA,
  onChangeB,
}: CompareSectionProps) {
  return (
    <Card>
      <h2 className="text-xl font-semibold">Compare Two Countries</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Choose any two visible countries and compare population, area, and density.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {(
          [
            ['First country', 'a', compareA, onChangeA],
            ['Second country', 'b', compareB, onChangeB],
          ] as const
        ).map(([label, prefix, value, onChange]) => (
          <select
            key={prefix}
            aria-label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={CONTROL_CLASSES}
          >
            {countries.map((country) => (
              <option key={`${prefix}-${country.name.common}`} value={country.name.common}>
                {country.name.common}
              </option>
            ))}
          </select>
        ))}
      </div>
      {countryA && countryB ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <Summary country={countryA} />
            <Summary country={countryB} />
          </div>
          <ComparisonChart countryA={countryA} countryB={countryB} />
        </div>
      ) : null}
    </Card>
  )
}
