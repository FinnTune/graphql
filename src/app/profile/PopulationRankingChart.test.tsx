import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PopulationRankingChart from '@/app/profile/PopulationRankingChart'
import { brazil, india, japan } from '@/test/fixtures/countries'

describe('PopulationRankingChart', () => {
  it('renders a bar per country with its name and formatted population', async () => {
    const { container } = render(<PopulationRankingChart countries={[india, japan, brazil]} />)

    // Recharts' ResponsiveContainer measures itself in its own effect, one
    // render cycle after mount, so poll instead of asserting immediately.
    await waitFor(() => {
      expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(3)
    })
    expect(screen.getByText('India')).toBeInTheDocument()
    expect(screen.getByText('Japan')).toBeInTheDocument()
    expect(screen.getByText('Brazil')).toBeInTheDocument()
    // India's population also happens to land on an auto-generated X-axis
    // tick, so the same formatted value can legitimately appear twice.
    expect(screen.getAllByText('1,400,000,000').length).toBeGreaterThan(0)
  })

  it('renders nothing but empty axes for an empty country list', () => {
    const { container } = render(<PopulationRankingChart countries={[]} />)

    expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(0)
  })
})
