'use client'

import { useMemo, useState } from 'react'
import type { Topology } from 'topojson-specification'
import worldTopology from '@/data/world-countries-50m.json'
import { formatNumber, type Country } from '@/lib/country-data'
import {
  buildCountryValueIndex,
  colorForValue,
  getValueRange,
  projectWorldTopology,
  MAP_UNMATCHED_FILL,
  WORLD_MAP_VIEWBOX,
  type MapMetric,
} from '@/lib/world-map'

const METRIC_LABELS: Record<MapMetric, string> = {
  population: 'Population',
  density: 'Density',
}

type WorldMapProps = {
  countries: Country[]
  selectedCountry: string | null
  onSelectCountry: (name: string) => void
}

export default function WorldMap({ countries, selectedCountry, onSelectCountry }: WorldMapProps) {
  const [metric, setMetric] = useState<MapMetric>('population')

  const features = useMemo(() => projectWorldTopology(worldTopology as unknown as Topology), [])
  const valueIndex = useMemo(() => buildCountryValueIndex(countries, metric), [countries, metric])
  const { min, max } = useMemo(
    () => getValueRange(Array.from(valueIndex.values()).map((entry) => entry.value)),
    [valueIndex]
  )

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">World Map</h2>
          <p className="mt-1 text-sm text-slate-500">
            Click a highlighted country to see its details. Shading reflects your current filter.
          </p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Map color metric">
          {(Object.keys(METRIC_LABELS) as MapMetric[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={metric === option}
              onClick={() => setMetric(option)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                metric === option
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'
              }`}
            >
              {METRIC_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={WORLD_MAP_VIEWBOX}
        role="img"
        aria-label="World map colored by the selected metric"
        className="mt-4 h-auto w-full"
      >
        {features.map((countryFeature, index) => {
          const match = valueIndex.get(countryFeature.ccn3)
          const isSelected = match?.country.name.common === selectedCountry
          const fill = match ? colorForValue(match.value, min, max) : MAP_UNMATCHED_FILL

          return (
            <path
              // A handful of territories share a missing or reused ISO
              // numeric code (e.g. Kosovo/Somaliland both fall back to
              // "000"), so ccn3/name aren't unique — index is, since
              // `features` is a stable, memoized array.
              key={index}
              d={countryFeature.path}
              fill={fill}
              stroke={isSelected ? '#4f46e5' : '#ffffff'}
              strokeWidth={isSelected ? 1.5 : 0.5}
              role={match ? 'button' : undefined}
              tabIndex={match ? 0 : undefined}
              aria-label={match ? match.country.name.common : undefined}
              onClick={match ? () => onSelectCountry(match.country.name.common) : undefined}
              onKeyDown={
                match
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onSelectCountry(match.country.name.common)
                      }
                    }
                  : undefined
              }
              className={match ? 'cursor-pointer transition-opacity hover:opacity-80' : undefined}
            >
              <title>
                {match
                  ? `${match.country.name.common}: ${formatNumber(Math.round(match.value))}${
                      metric === 'density' ? '/km2' : ''
                    }`
                  : countryFeature.name}
              </title>
            </path>
          )
        })}
      </svg>

      <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
        <span>Low</span>
        <div
          className="h-2 flex-1 rounded"
          style={{ background: 'linear-gradient(to right, #e0e7ff, #312e81)' }}
        />
        <span>High</span>
        <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
          {countries.length} countries in filter
        </span>
      </div>
    </section>
  )
}
