'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { density, formatNumber, getComparisonMaxes, normalized, type Country } from '@/lib/country-data'

const COLOR_A = '#6366f1'
const COLOR_B = '#8b5cf6'

export type ComparisonMetricRow = {
  metric: string
  a: number
  b: number
  rawA: number
  rawB: number
  unit: string
}

export function buildComparisonRows(countryA: Country, countryB: Country): ComparisonMetricRow[] {
  const maxes = getComparisonMaxes(countryA, countryB)

  return [
    {
      metric: 'Population',
      a: normalized(countryA.population, maxes.population),
      b: normalized(countryB.population, maxes.population),
      rawA: countryA.population,
      rawB: countryB.population,
      unit: '',
    },
    {
      metric: 'Area',
      a: normalized(countryA.area, maxes.area),
      b: normalized(countryB.area, maxes.area),
      rawA: countryA.area,
      rawB: countryB.area,
      unit: ' km2',
    },
    {
      metric: 'Density',
      a: normalized(density(countryA), maxes.density),
      b: normalized(density(countryB), maxes.density),
      rawA: density(countryA),
      rawB: density(countryB),
      unit: '/km2',
    },
  ]
}

type ComparisonChartProps = {
  countryA: Country
  countryB: Country
}

export default function ComparisonChart({ countryA, countryB }: ComparisonChartProps) {
  const data = buildComparisonRows(countryA, countryB)

  return (
    <div>
      <div className="mb-2 flex gap-4 text-xs text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLOR_A }} />
          {countryA.name.common}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLOR_B }} />
          {countryB.name.common}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="metric" tick={{ fontSize: 12 }} interval={0} />
          <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, name, entry) => {
              if (typeof value !== 'number') return [value, name]
              const row = entry.payload as ComparisonMetricRow
              const raw = name === countryA.name.common ? row.rawA : row.rawB
              return [`${formatNumber(Math.round(raw))}${row.unit} (${value.toFixed(1)}%)`, name]
            }}
          />
          <Bar dataKey="a" name={countryA.name.common} fill={COLOR_A} radius={[4, 4, 0, 0]} animationDuration={600} />
          <Bar dataKey="b" name={countryB.name.common} fill={COLOR_B} radius={[4, 4, 0, 0]} animationDuration={600} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
