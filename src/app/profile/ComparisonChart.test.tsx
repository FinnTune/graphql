import { render, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ComparisonChart, { buildComparisonRows } from '@/app/profile/ComparisonChart'
import { japan, monaco } from '@/test/fixtures/countries'

describe('buildComparisonRows', () => {
  const rows = buildComparisonRows(japan, monaco)

  it('builds one row per metric with percentages normalized to the larger country', () => {
    expect(rows.map((row) => row.metric)).toEqual(['Population', 'Area', 'Density'])

    const population = rows[0]
    expect(population.rawA).toBe(japan.population)
    expect(population.rawB).toBe(monaco.population)
    expect(population.a).toBe(100)
    expect(population.b).toBeCloseTo((monaco.population / japan.population) * 100, 5)
  })

  it('gives the denser country 100% on the density row', () => {
    const densityRow = rows[2]
    expect(densityRow.b).toBe(100)
    expect(densityRow.a).toBeLessThan(100)
  })
})

describe('ComparisonChart', () => {
  it('renders a bar group per metric with a legend entry per country', async () => {
    const { container } = render(<ComparisonChart countryA={japan} countryB={monaco} />)

    // Recharts' ResponsiveContainer measures itself in its own effect, one
    // render cycle after mount, so poll instead of asserting immediately.
    await waitFor(() => {
      expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(6)
    })
    // Scoped to `container`: Recharts leaves a hidden singleton measurement
    // span attached directly to `document.body` (outside this component's
    // tree) that can echo the same axis-label text and confuse `screen`-wide
    // queries across tests.
    const scoped = within(container)
    expect(scoped.getByText('Population')).toBeInTheDocument()
    expect(scoped.getByText('Area')).toBeInTheDocument()
    expect(scoped.getByText('Density')).toBeInTheDocument()
    expect(scoped.getAllByText('Japan').length).toBeGreaterThan(0)
    expect(scoped.getAllByText('Monaco').length).toBeGreaterThan(0)
  })
})
