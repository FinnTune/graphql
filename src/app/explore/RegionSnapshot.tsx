import { formatNumber, type RegionStats } from '@/lib/country-data'
import Card from '@/app/explore/Card'

export default function RegionSnapshot({ regionStats }: { regionStats: RegionStats[] }) {
  return (
    <Card as="article">
      <h2 className="text-xl font-semibold">Region Snapshot</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {regionStats.map((region) => (
          <li key={region.region} className="flex justify-between">
            <span>{region.region}</span>
            <span>
              {region.countries} countries - {formatNumber(region.population)} people
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
