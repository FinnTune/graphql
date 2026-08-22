import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Profile from '@/app/profile/page'
import { GRAPHQL_ENDPOINT } from '@/lib/graphql-client'
import { sampleCountries } from '@/test/fixtures/countries'

const { replaceMock, getSearchParams, setSearchParams } = vi.hoisted(() => {
  let params = new URLSearchParams()
  return {
    replaceMock: vi.fn(),
    getSearchParams: () => params,
    setSearchParams: (next: URLSearchParams) => {
      params = next
    },
  }
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  usePathname: () => '/profile',
  useSearchParams: () => getSearchParams(),
}))

function mockCountriesResponse(countries = sampleCountries) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { countries } }),
    })
  )
}

describe('Profile dashboard', () => {
  beforeEach(() => {
    mockCountriesResponse()
    setSearchParams(new URLSearchParams())
    replaceMock.mockClear()
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
    expect(fetch).toHaveBeenCalledWith(
      GRAPHQL_ENDPOINT,
      expect.objectContaining({ method: 'POST' })
    )
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

  it('renders a comparison summary and chart for the default country pair', async () => {
    render(<Profile />)

    await screen.findByRole('heading', { name: /compare two countries/i })
    // The default pair comes from the population-sorted filtered list (the
    // default sort), so it's the two most populous countries — India and
    // the United States — not fixture insertion order.
    await waitFor(() => {
      expect(screen.getByText(/1,400,000,000 people/i)).toBeInTheDocument()
    })
    expect(screen.getAllByText('India').length).toBeGreaterThan(0)
    expect(screen.getAllByText('United States').length).toBeGreaterThan(0)
  })

  it('renders the top population ranking section', async () => {
    render(<Profile />)

    const ranking = await screen.findByRole('heading', { name: /top 8 countries by population/i })
    const section = ranking.closest('section')
    expect(section).not.toBeNull()
    // Recharts' ResponsiveContainer measures itself in its own effect, one
    // render cycle after this section first mounts, so poll instead of
    // asserting immediately.
    await waitFor(
      () => {
        expect(section?.querySelectorAll('.recharts-bar-rectangle').length).toBeGreaterThan(0)
      },
      { timeout: 5000 }
    )
    expect(within(section as HTMLElement).getByText('India')).toBeInTheDocument()
    // Recharts wraps long axis labels across multiple <tspan> lines (with the
    // space consumed by the line break), so join them back together to check.
    const labels = Array.from(section?.querySelectorAll('.recharts-yAxis-tick-labels text') ?? [])
    const labelTexts = labels.map((label) =>
      Array.from(label.querySelectorAll('tspan'))
        .map((tspan) => tspan.textContent)
        .join(' ')
    )
    expect(labelTexts).toContain('United States')
  })

  it('restores query, region, and sort state from the URL on load', async () => {
    setSearchParams(new URLSearchParams('q=mo&region=Europe&sort=name'))
    render(<Profile />)

    await screen.findByRole('heading', { name: /global population explorer/i })

    expect(screen.getByPlaceholderText(/search by country or capital/i)).toHaveValue('mo')
    expect(screen.getByDisplayValue('Europe')).toBeInTheDocument()
    expect(screen.getByDisplayValue(/sort: name/i)).toBeInTheDocument()
  })

  it('syncs a region change to the URL via router.replace', async () => {
    const user = userEvent.setup()
    render(<Profile />)

    await screen.findByRole('heading', { name: /global population explorer/i })
    await user.selectOptions(screen.getByDisplayValue('All'), 'Europe')

    // Monaco is the only European country in the fixture, so it also becomes
    // the (only possible) default compare pair once the region filter narrows.
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/profile?region=Europe&a=Monaco&b=Monaco', { scroll: false })
    })
  })

  it('omits default values from the URL', async () => {
    render(<Profile />)

    await screen.findByRole('heading', { name: /global population explorer/i })

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalled()
    })
    const lastCall = replaceMock.mock.calls.at(-1)?.[0]
    // Default query/region/sort are omitted; only the resolved default
    // compare pair (India/United States) ends up in the URL.
    expect(lastCall).toBe('/profile?a=India&b=United+States')
  })
})
