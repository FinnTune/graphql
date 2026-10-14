import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import WorldMap from '@/app/explore/WorldMap'
import { japan, monaco, unitedStates } from '@/test/fixtures/countries'

const countries = [japan, monaco, unitedStates]

describe('WorldMap', () => {
  it('renders an svg map with a clickable path for each matched country', () => {
    render(<WorldMap countries={countries} selectedCountry={null} onSelectCountry={vi.fn()} />)

    expect(screen.getByRole('group', { name: /world map/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Japan' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Monaco' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'United States' })).toBeInTheDocument()
  })

  it('offers the map values as an accessible table, largest first', () => {
    render(<WorldMap countries={countries} selectedCountry={null} onSelectCountry={vi.fn()} />)

    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows.map((row) => row.textContent)).toEqual([
      'CountryPopulation',
      expect.stringContaining('United States'),
      expect.stringContaining('Japan'),
      expect.stringContaining('Monaco'),
    ])
  })

  it('calls onSelectCountry with the country name when a matched country is clicked', async () => {
    const user = userEvent.setup()
    const onSelectCountry = vi.fn()
    render(<WorldMap countries={countries} selectedCountry={null} onSelectCountry={onSelectCountry} />)

    await user.click(screen.getByRole('button', { name: 'Monaco' }))

    expect(onSelectCountry).toHaveBeenCalledWith('Monaco')
  })

  it('calls onSelectCountry when a matched country is activated via keyboard', async () => {
    const user = userEvent.setup()
    const onSelectCountry = vi.fn()
    render(<WorldMap countries={countries} selectedCountry={null} onSelectCountry={onSelectCountry} />)

    screen.getByRole('button', { name: 'Japan' }).focus()
    await user.keyboard('{Enter}')

    expect(onSelectCountry).toHaveBeenCalledWith('Japan')
  })

  it('does not render a clickable role for countries outside the current filter', () => {
    render(<WorldMap countries={[japan]} selectedCountry={null} onSelectCountry={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Monaco' })).not.toBeInTheDocument()
  })

  it('switches the active metric when a toggle button is clicked', async () => {
    const user = userEvent.setup()
    render(<WorldMap countries={countries} selectedCountry={null} onSelectCountry={vi.fn()} />)

    const densityButton = screen.getByRole('button', { name: 'Density' })
    expect(screen.getByRole('button', { name: 'Population' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(densityButton)

    expect(densityButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Population' })).toHaveAttribute('aria-pressed', 'false')
  })
})
