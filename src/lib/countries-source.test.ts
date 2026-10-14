import { describe, expect, it, vi } from 'vitest'

// The global setup mocks this module with small fixtures; these tests are
// about the real bundled snapshot.
const { loadCountries } = await vi.importActual<typeof import('@/lib/countries-source')>(
  '@/lib/countries-source'
)

describe('bundled countries snapshot', () => {
  it('contains a full, valid dataset', async () => {
    const countries = await loadCountries()

    expect(countries.length).toBeGreaterThan(200)
    expect(countries.find((country) => country.name.common === 'Japan')).toMatchObject({
      region: 'Asia',
      ccn3: '392',
    })
  })

  it('has unique country names (they are used as React keys and URL values)', async () => {
    const names = (await loadCountries()).map((country) => country.name.common)

    expect(new Set(names).size).toBe(names.length)
  })

  it('has plausible totals', async () => {
    const countries = await loadCountries()
    const total = countries.reduce((sum, country) => sum + country.population, 0)

    expect(total).toBeGreaterThan(7_000_000_000)
    expect(total).toBeLessThan(9_000_000_000)
  })
})
