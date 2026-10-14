import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PopulationRankingChart from '@/app/explore/PopulationRankingChart'
import { brazil, india, japan } from '@/test/fixtures/countries'

describe('PopulationRankingChart', () => {
  it('renders a bar per country with its name and formatted population', async () => {
    const { container } = render(<PopulationRankingChart countries={[india, japan, brazil]} />)

    // Recharts' ResponsiveContainer measures itself in its own effect, one
    // render cycle after mount, so poll instead of asserting immediately.
    await waitFor(() => {
      expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(3)
    })
    const chart = within(container.querySelector('[aria-hidden="true"]') as HTMLElement)
    expect(chart.getByText('India')).toBeInTheDocument()
    expect(chart.getByText('Japan')).toBeInTheDocument()
    expect(chart.getByText('Brazil')).toBeInTheDocument()
    // India's population also happens to land on an auto-generated X-axis
    // tick, so the same formatted value can legitimately appear twice.
    expect(chart.getAllByText('1,400,000,000').length).toBeGreaterThan(0)
  })

  it('offers the same data as an accessible table', () => {
    render(<PopulationRankingChart countries={[india, japan]} />)

    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows.map((row) => row.textContent)).toEqual([
      'CountryPopulation',
      'India1,400,000,000',
      'Japan125,000,000',
    ])
  })

  it('renders nothing but empty axes for an empty country list', () => {
    const { container } = render(<PopulationRankingChart countries={[]} />)

    expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(0)
  })
})
