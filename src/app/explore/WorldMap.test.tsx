import { fireEvent, render, screen, within } from '@testing-library/react'
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

  describe('zoom and pan', () => {
    const transformOf = (container: HTMLElement) => container.querySelector('svg > g')?.getAttribute('transform')

    it('zooms in and out with the controls and resets the view', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <WorldMap countries={countries} selectedCountry={null} onSelectCountry={vi.fn()} />
      )

      expect(screen.getByRole('button', { name: 'Zoom out' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
      expect(transformOf(container)).toBe('translate(0 0) scale(1)')

      await user.click(screen.getByRole('button', { name: 'Zoom in' }))
      expect(transformOf(container)).toContain('scale(1.5)')
      expect(screen.getByText(/1\.5x - drag to pan/)).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Zoom out' }))
      expect(transformOf(container)).toBe('translate(0 0) scale(1)')

      await user.click(screen.getByRole('button', { name: 'Zoom in' }))
      await user.click(screen.getByRole('button', { name: 'Reset' }))
      expect(transformOf(container)).toBe('translate(0 0) scale(1)')
    })

    it('disables zoom in at the maximum zoom', async () => {
      const user = userEvent.setup()
      render(<WorldMap countries={countries} selectedCountry={null} onSelectCountry={vi.fn()} />)

      for (let i = 0; i < 10; i++) {
        const zoomIn = screen.getByRole('button', { name: 'Zoom in' })
        if (zoomIn.hasAttribute('disabled')) break
        await user.click(zoomIn)
      }

      expect(screen.getByRole('button', { name: 'Zoom in' })).toBeDisabled()
    })

    it('pans by dragging when zoomed, without selecting the country under the cursor', async () => {
      const user = userEvent.setup()
      const onSelectCountry = vi.fn()
      const { container } = render(
        <WorldMap countries={countries} selectedCountry={null} onSelectCountry={onSelectCountry} />
      )
      await user.click(screen.getByRole('button', { name: 'Zoom in' }))
      await user.click(screen.getByRole('button', { name: 'Zoom in' }))
      const before = transformOf(container)

      const svg = container.querySelector('svg') as SVGSVGElement
      fireEvent.pointerDown(svg, { clientX: 300, clientY: 150, button: 0 })
      fireEvent.pointerMove(svg, { clientX: 250, clientY: 150 })
      fireEvent.pointerUp(svg, { clientX: 250, clientY: 150 })
      fireEvent.click(screen.getByRole('button', { name: 'Japan' }))

      expect(transformOf(container)).not.toBe(before)
      expect(onSelectCountry).not.toHaveBeenCalled()

      // A later plain click selects normally again.
      await new Promise((resolve) => setTimeout(resolve, 5))
      fireEvent.click(screen.getByRole('button', { name: 'Japan' }))
      expect(onSelectCountry).toHaveBeenCalledWith('Japan')
    })
  })

  it('shows a tooltip with the value while hovering a country', () => {
    render(<WorldMap countries={countries} selectedCountry={null} onSelectCountry={vi.fn()} />)

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Japan' }), { clientX: 10, clientY: 10 })
    expect(screen.getByRole('presentation')).toHaveTextContent('Japan: 125,000,000')

    fireEvent.pointerLeave(screen.getByRole('button', { name: 'Japan' }))
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument()
  })

  it('shows a legend with the real value range, which follows the metric', async () => {
    const user = userEvent.setup()
    render(<WorldMap countries={countries} selectedCountry={null} onSelectCountry={vi.fn()} />)

    const legend = screen.getByTestId('map-legend')
    expect(legend.firstChild).toHaveTextContent('39K')
    expect(legend.lastChild).toHaveTextContent('331M')

    await user.click(screen.getByRole('button', { name: 'Density' }))
    expect(screen.getByTestId('map-legend').lastChild).toHaveTextContent('/km2')
  })

  it('omits the legend when no countries match the filter', () => {
    render(<WorldMap countries={[]} selectedCountry={null} onSelectCountry={vi.fn()} />)

    expect(screen.queryByTestId('map-legend')).not.toBeInTheDocument()
  })
})
