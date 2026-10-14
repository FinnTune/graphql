import type { SortOption } from '@/lib/country-data'
import Card from '@/app/explore/Card'

const CONTROL_CLASSES =
  'rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950'

type FilterBarProps = {
  query: string
  region: string
  sortBy: SortOption
  regions: string[]
  onQueryChange: (value: string) => void
  onRegionChange: (value: string) => void
  onSortChange: (value: SortOption) => void
}

export default function FilterBar({
  query,
  region,
  sortBy,
  regions,
  onQueryChange,
  onRegionChange,
  onSortChange,
}: FilterBarProps) {
  return (
    <Card className="grid gap-3 p-5 md:grid-cols-3">
      <input
        type="text"
        aria-label="Search by country or capital"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search by country or capital..."
        className={CONTROL_CLASSES}
      />
      <select
        aria-label="Filter by region"
        value={region}
        onChange={(event) => onRegionChange(event.target.value)}
        className={CONTROL_CLASSES}
      >
        {regions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <select
        aria-label="Sort countries"
        value={sortBy}
        onChange={(event) => onSortChange(event.target.value as SortOption)}
        className={CONTROL_CLASSES}
      >
        <option value="population">Sort: Population</option>
        <option value="density">Sort: Density</option>
        <option value="name">Sort: Name</option>
      </select>
    </Card>
  )
}
