'use client'

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber, type Country } from '@/lib/country-data'

type PopulationRankingChartProps = {
  countries: Country[]
}

export default function PopulationRankingChart({ countries }: PopulationRankingChartProps) {
  const data = countries.map((country) => ({
    name: country.name.common,
    population: country.population,
  }))

  return (
    <figure>
      <figcaption className="sr-only">
        Population of the most populous countries in the current filter
      </figcaption>
      <table className="sr-only">
        <thead>
          <tr>
            <th scope="col">Country</th>
            <th scope="col">Population</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.name}>
              <th scope="row">{row.name}</th>
              <td>{formatNumber(row.population)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* The table above is the accessible version of this chart. */}
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={Math.max(240, data.length * 40)}>
          <BarChart accessibilityLayer={false} data={data} layout="vertical" margin={{ top: 8, right: 48, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={formatNumber} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} interval={0} />
            <Tooltip
              formatter={(value) => [typeof value === 'number' ? formatNumber(value) : value, 'Population']}
            />
            <Bar dataKey="population" fill="#4f46e5" radius={[0, 6, 6, 0]} animationDuration={600}>
              <LabelList
                dataKey="population"
                position="right"
                formatter={(value) => (typeof value === 'number' ? formatNumber(value) : value)}
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  )
}
