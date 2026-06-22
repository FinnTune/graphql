import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Profile from '@/app/profile/page'
import { REST_COUNTRIES_URL } from '@/lib/country-data'
import { sampleCountries } from '@/test/fixtures/countries'

function mockCountriesResponse(countries = sampleCountries) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => countries,
    })
  )
}

describe('Profile dashboard', () => {
  beforeEach(() => {
    mockCountriesResponse()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('shows a loading state before data arrives', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => undefined)))
    render(<Profile />)

    expect(screen.getByText(/loading global data/i)).toBeInTheDocument()
  })

  it('loads country data and renders the dashboard header', async () => {
    render(<Profile />)

    expect(await screen.findByRole('heading', { name: /global population explorer/i })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(REST_COUNTRIES_URL)
  })

  it('shows an error message when the API request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      })
    )

    render(<Profile />)

    expect(
      await screen.findByText(/could not load country data right now/i)
    ).toBeInTheDocument()
  })

  it('filters countries by search query', async () => {
    const user = userEvent.setup()
    render(<Profile />)

    await screen.findByRole('heading', { name: /global population explorer/i })
    await user.type(screen.getByPlaceholderText(/search by country or capital/i), 'monaco')

    const explorer = screen.getByText('Country Explorer').closest('section')
    expect(explorer).not.toBeNull()
    expect(within(explorer as HTMLElement).getByRole('heading', { name: 'Monaco', level: 3 })).toBeInTheDocument()
    expect(within(explorer as HTMLElement).queryByRole('heading', { name: 'Japan', level: 3 })).not.toBeInTheDocument()
  })

  it('filters countries by region', async () => {
    const user = userEvent.setup()
    render(<Profile />)

    await screen.findByRole('heading', { name: /global population explorer/i })
    await user.selectOptions(screen.getByDisplayValue('All'), 'Europe')

    const explorer = screen.getByText('Country Explorer').closest('section')
    expect(explorer).not.toBeNull()
    expect(within(explorer as HTMLElement).getByRole('heading', { name: 'Monaco', level: 3 })).toBeInTheDocument()
    expect(within(explorer as HTMLElement).queryByRole('heading', { name: 'Japan', level: 3 })).not.toBeInTheDocument()
  })

  it('updates KPI cards for the active filter', async () => {
    const user = userEvent.setup()
    render(<Profile />)

    await screen.findByRole('heading', { name: /global population explorer/i })
    await user.selectOptions(screen.getByDisplayValue('All'), 'Europe')

    const kpiCard = screen.getByText('Countries Matching Filter').closest('article')
    expect(kpiCard).not.toBeNull()
    expect(within(kpiCard as HTMLElement).getByText('1')).toBeInTheDocument()
  })

  it('sorts countries alphabetically when name sort is selected', async () => {
    const user = userEvent.setup()
    render(<Profile />)

    await screen.findByRole('heading', { name: /global population explorer/i })
    await user.selectOptions(screen.getByDisplayValue(/sort: population/i), 'name')

    const explorer = screen.getByText('Country Explorer').closest('section')
    expect(explorer).not.toBeNull()
    const countryNames = within(explorer as HTMLElement)
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent)

    expect(countryNames.slice(0, 3)).toEqual(['Brazil', 'India', 'Japan'])
  })

  it('highlights Monaco as the densest country in the footer', async () => {
    render(<Profile />)

    expect(
      await screen.findByText(/current densest country in filter/i)
    ).toHaveTextContent('Monaco')
  })

  it('renders comparison cards for the default country pair', async () => {
    render(<Profile />)

    await screen.findByRole('heading', { name: /compare two countries/i })
    await waitFor(() => {
      expect(screen.getAllByText(/population index/i).length).toBeGreaterThan(0)
    })
  })

  it('renders the top population ranking section', async () => {
    render(<Profile />)

    const ranking = await screen.findByRole('heading', { name: /top 8 countries by population/i })
    const section = ranking.closest('section')
    expect(section).not.toBeNull()
    expect(within(section as HTMLElement).getByText('India')).toBeInTheDocument()
    expect(within(section as HTMLElement).getByText('United States')).toBeInTheDocument()
  })
})
