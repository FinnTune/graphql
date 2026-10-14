import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Explore from '@/app/explore/page'
import { loadCountries } from '@/lib/countries-source'
import { graphqlCalls, installFakeApi } from '@/test/fake-api'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/explore',
}))

describe('Explore page (server component)', () => {
  beforeEach(() => {
    installFakeApi()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('server-renders the dashboard for the URL state without a client fetch', async () => {
    render(await Explore({ searchParams: Promise.resolve({ region: 'Europe', sort: 'name' }) }))

    expect(screen.getByRole('heading', { name: 'Monaco', level: 3 })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Japan', level: 3 })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Filter by region')).toHaveValue('Europe')
    expect(graphqlCalls(vi.mocked(fetch))).toHaveLength(0)
  })

  it('ignores repeated query params and falls back to defaults for junk', async () => {
    render(await Explore({ searchParams: Promise.resolve({ sort: ['bogus', 'name'], q: undefined }) }))

    expect(screen.getByLabelText('Sort countries')).toHaveValue('population')
  })

  it('falls back to client-side loading when the server load fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.mocked(loadCountries).mockRejectedValue(new Error('source offline'))

    render(await Explore({ searchParams: Promise.resolve({}) }))

    expect(screen.getByText(/loading global data/i)).toBeInTheDocument()
  })
})
