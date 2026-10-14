import { formatNumber } from '@/lib/country-data'
import Card from '@/app/explore/Card'

type KpiCardsProps = {
  matching: number
  population: number
  independent: number
  withLanguages: number
}

export default function KpiCards({ matching, population, independent, withLanguages }: KpiCardsProps) {
  const kpis = [
    { label: 'Countries Matching Filter', value: matching, size: 'text-3xl' },
    { label: 'Global Population', value: population, size: 'text-3xl' },
    { label: 'Independent States (Filtered)', value: independent, size: 'text-2xl' },
    { label: 'Language Data Coverage', value: withLanguages, size: 'text-2xl' },
  ]

  return (
    <section aria-label="Key figures" className="grid gap-4 md:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} as="article" className="p-5">
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.label}</h2>
          <p className={`mt-2 ${kpi.size} font-semibold`}>{formatNumber(kpi.value)}</p>
        </Card>
      ))}
    </section>
  )
}
