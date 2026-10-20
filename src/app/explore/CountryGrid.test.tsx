import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import CountryGrid from '@/app/explore/CountryGrid'
import type { Country } from '@/lib/country-data'
import { japan } from '@/test/fixtures/countries'

function makeCountries(count: number): Country[] {
  return Array.from({ length: count }, (_, index) => ({
    ...japan,
    name: { common: `Country ${index + 1}` },
  }))
}

const cardNames = () => screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)

describe('CountryGrid', () => {
  it('shows the first page and a count', () => {
    render(<CountryGrid countries={makeCountries(40)} />)

    expect(cardNames()).toHaveLength(18)
    expect(screen.getByText('Showing 18 of 40 countries')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show 18 more' })).toBeInTheDocument()
  })

  it('reveals further pages until everything is shown, then hides the button', async () => {
    const user = userEvent.setup()
    render(<CountryGrid countries={makeCountries(40)} />)

    await user.click(screen.getByRole('button', { name: 'Show 18 more' }))
    expect(cardNames()).toHaveLength(36)

    await user.click(screen.getByRole('button', { name: 'Show 4 more' }))
    expect(cardNames()).toHaveLength(40)
    expect(screen.getByText('Showing 40 of 40 countries')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /show .* more/i })).not.toBeInTheDocument()
  })

  it('starts over from the first page when the list changes', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<CountryGrid countries={makeCountries(40)} />)
    await user.click(screen.getByRole('button', { name: 'Show 18 more' }))
    expect(cardNames()).toHaveLength(36)

    rerender(<CountryGrid countries={makeCountries(30)} />)

    expect(cardNames()).toHaveLength(18)
    expect(screen.getByText('Showing 18 of 30 countries')).toBeInTheDocument()
  })

  it('has no button for short lists, and handles an empty list', () => {
    const { rerender } = render(<CountryGrid countries={makeCountries(5)} />)
    expect(screen.getByText('Showing 5 of 5 countries')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()

    rerender(<CountryGrid countries={[]} />)
    expect(screen.getByText('Showing 0 of 0 countries')).toBeInTheDocument()
  })
})
