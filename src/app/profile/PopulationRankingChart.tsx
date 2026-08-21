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
    <ResponsiveContainer width="100%" height={Math.max(240, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 48, bottom: 8, left: 8 }}>
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
  )
}
