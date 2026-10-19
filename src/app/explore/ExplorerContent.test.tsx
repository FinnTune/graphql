import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ExplorerContent from '@/app/explore/ExplorerContent'
import { loadExplorerData } from '@/lib/graphql/execute-explorer'
import { toExplorerVariables } from '@/lib/graphql-client'
import { EXPLORER_URL_DEFAULTS, type ExplorerUrlState } from '@/lib/url-state'
import { graphqlCalls, installFakeApi, variablesOf } from '@/test/fake-api'

const { replaceMock } = vi.hoisted(() => ({ replaceMock: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  usePathname: () => '/explore',
}))

// Mirrors what the server component does: load data for the URL state and
// hand it to the client component.
async function renderExplorer(state: Partial<ExplorerUrlState> = {}, { ssr = true } = {}) {
  const initialState = { ...EXPLORER_URL_DEFAULTS, ...state }
  const initialData = ssr ? await loadExplorerData(toExplorerVariables(initialState)) : null
  return render(<ExplorerContent initialState={initialState} initialData={initialData} />)
}

function explorerSection() {
  const section = screen.getByText('Country Explorer').closest('section')
  expect(section).not.toBeNull()
  return within(section as HTMLElement)
}

describe('Explorer dashboard', () => {
  beforeEach(() => {
    installFakeApi()
    replaceMock.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders server-provided data immediately without a client fetch', async () => {
    await renderExplorer()

    expect(screen.getByRole('heading', { name: /global population explorer/i })).toBeInTheDocument()
    expect(graphqlCalls(vi.mocked(fetch))).toHaveLength(0)
  })

  it('shows a loading state, then fetches over GraphQL when there is no server data', async () => {
    await renderExplorer({}, { ssr: false })

    expect(screen.getByText(/loading global data/i)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /global population explorer/i })).toBeInTheDocument()
    expect(graphqlCalls(vi.mocked(fetch))).toHaveLength(1)
  })

  it('shows an error with a retry button, and recovers on retry', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))

    await renderExplorer({}, { ssr: false })
    expect(await screen.findByText(/could not load country data right now/i)).toBeInTheDocument()

    installFakeApi()
    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(await screen.findByRole('heading', { name: /global population explorer/i })).toBeInTheDocument()
  })

  it('keeps showing data and offers a retry when a refetch fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await renderExplorer()

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    await user.selectOptions(screen.getByLabelText('Filter by region'), 'Europe')

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load country data/i)
    expect(screen.getByRole('heading', { name: 'Japan', level: 3 })).toBeInTheDocument()
  })

  it('filters countries by search query on the server', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.mocked(fetch)
    await renderExplorer()

    await user.type(screen.getByPlaceholderText(/search by country or capital/i), 'monaco')

    await waitFor(() => {
      expect(explorerSection().queryByRole('heading', { name: 'Japan', level: 3 })).not.toBeInTheDocument()
    })
    expect(explorerSection().getByRole('heading', { name: 'Monaco', level: 3 })).toBeInTheDocument()

    // Typing is debounced into a single request, with the final text.
    const calls = graphqlCalls(fetchMock)
    expect(calls).toHaveLength(1)
    expect(variablesOf(calls[0])).toMatchObject({ search: 'monaco' })
  })

  it('filters countries by region', async () => {
    const user = userEvent.setup()
    await renderExplorer()

    await user.selectOptions(screen.getByLabelText('Filter by region'), 'Europe')

    await waitFor(() => {
      expect(explorerSection().queryByRole('heading', { name: 'Japan', level: 3 })).not.toBeInTheDocument()
    })
    expect(explorerSection().getByRole('heading', { name: 'Monaco', level: 3 })).toBeInTheDocument()
  })

  it('updates KPI cards for the active filter', async () => {
    const user = userEvent.setup()
    await renderExplorer()

    await user.selectOptions(screen.getByLabelText('Filter by region'), 'Europe')

    const kpiCard = screen.getByText('Countries Matching Filter').closest('article') as HTMLElement
    await waitFor(() => {
      expect(within(kpiCard).getByText('1')).toBeInTheDocument()
    })
  })

  it('sorts countries alphabetically when name sort is selected', async () => {
    const user = userEvent.setup()
    await renderExplorer()

    await user.selectOptions(screen.getByLabelText('Sort countries'), 'name')

    await waitFor(() => {
      const names = explorerSection()
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent)
      expect(names.slice(0, 3)).toEqual(['Brazil', 'India', 'Japan'])
    })
  })

  it('highlights Monaco as the densest country in the footer', async () => {
    await renderExplorer()

    expect(screen.getByText(/current densest country in filter/i)).toHaveTextContent('Monaco')
  })

  it('keeps the spotlight on the globally densest country when a filter is applied', async () => {
    const user = userEvent.setup()
    await renderExplorer()

    await user.selectOptions(screen.getByLabelText('Filter by region'), 'Asia')

    await waitFor(() => {
      expect(screen.getByText(/densest country in filter/i)).toHaveTextContent('India')
    })
    const spotlight = screen.getByText(/spotlight: highest density/i).closest('article') as HTMLElement
    expect(within(spotlight).getByText('Monaco')).toBeInTheDocument()
  })

  it('renders a comparison summary and chart for the default country pair', async () => {
    await renderExplorer()

    // The default pair comes from the population-sorted list (the default
    // sort), so it's the two most populous countries - India and the
    // United States - not fixture insertion order.
    expect(screen.getByText(/1,400,000,000 people/i)).toBeInTheDocument()
    expect(screen.getAllByText('India').length).toBeGreaterThan(0)
    expect(screen.getAllByText('United States').length).toBeGreaterThan(0)
  })

  it('renders the top population ranking section', async () => {
    await renderExplorer()

    const ranking = screen.getByRole('heading', { name: /top 8 countries by population/i })
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
    const chart = within(section?.querySelector('[aria-hidden="true"]') as HTMLElement)
    expect(chart.getByText('India')).toBeInTheDocument()
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
    await renderExplorer({ query: 'mo', region: 'Europe', sortBy: 'name' })

    expect(screen.getByPlaceholderText(/search by country or capital/i)).toHaveValue('mo')
    expect(screen.getByLabelText('Filter by region')).toHaveValue('Europe')
    expect(screen.getByLabelText('Sort countries')).toHaveValue('name')
    expect(explorerSection().getByRole('heading', { name: 'Monaco', level: 3 })).toBeInTheDocument()
  })

  it('syncs a region change to the URL via router.replace', async () => {
    const user = userEvent.setup()
    await renderExplorer()

    await user.selectOptions(screen.getByLabelText('Filter by region'), 'Europe')

    // Monaco is the only European country in the fixture, so it also becomes
    // the (only possible) default compare pair once the region filter narrows.
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/explore?region=Europe&a=Monaco&b=Monaco', { scroll: false })
    })
  })

  it('omits default values from the URL', async () => {
    await renderExplorer()

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalled()
    })
    // Default query/region/sort are omitted; only the resolved default
    // compare pair (India/United States) ends up in the URL.
    expect(replaceMock.mock.calls.at(-1)?.[0]).toBe('/explore?a=India&b=United+States')
  })
})
