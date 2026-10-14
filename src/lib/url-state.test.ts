import { describe, expect, it } from 'vitest'
import { buildExplorerSearchParams, parseExplorerSearchParams, EXPLORER_URL_DEFAULTS } from '@/lib/url-state'

describe('parseExplorerSearchParams', () => {
  it('returns defaults when no params are present', () => {
    expect(parseExplorerSearchParams(new URLSearchParams())).toEqual(EXPLORER_URL_DEFAULTS)
  })

  it('reads query, region, sort, and compare selections', () => {
    const params = new URLSearchParams('q=japan&region=Asia&sort=density&a=Japan&b=Monaco')
    expect(parseExplorerSearchParams(params)).toEqual({
      query: 'japan',
      region: 'Asia',
      sortBy: 'density',
      compareA: 'Japan',
      compareB: 'Monaco',
    })
  })

  it('falls back to the default sort for an invalid sort value', () => {
    const params = new URLSearchParams('sort=not-a-real-option')
    expect(parseExplorerSearchParams(params).sortBy).toBe('population')
  })
})

describe('buildExplorerSearchParams', () => {
  it('omits keys that are at their default value', () => {
    expect(buildExplorerSearchParams(EXPLORER_URL_DEFAULTS).toString()).toBe('')
  })

  it('includes only the keys that differ from their defaults', () => {
    const params = buildExplorerSearchParams({
      query: 'japan',
      region: 'All',
      sortBy: 'name',
      compareA: '',
      compareB: '',
    })
    expect(params.toString()).toBe('q=japan&sort=name')
  })

  it('round-trips through parseExplorerSearchParams', () => {
    const state = { query: 'mo', region: 'Europe', sortBy: 'density' as const, compareA: 'Japan', compareB: 'Monaco' }
    expect(parseExplorerSearchParams(buildExplorerSearchParams(state))).toEqual(state)
  })
})
