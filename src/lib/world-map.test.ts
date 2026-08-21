import { describe, expect, it } from 'vitest'
import type { Topology } from 'topojson-specification'
import worldTopology from '@/data/world-countries-50m.json'
import { india, japan, monaco } from '@/test/fixtures/countries'
import {
  buildCountryValueIndex,
  colorForValue,
  getValueRange,
  metricValue,
  projectWorldTopology,
  MAP_UNMATCHED_FILL,
} from '@/lib/world-map'

describe('projectWorldTopology', () => {
  const features = projectWorldTopology(worldTopology as unknown as Topology)

  it('projects every country geometry to a non-empty SVG path', () => {
    expect(features.length).toBeGreaterThan(200)
    features.forEach((feature) => {
      expect(feature.path.length).toBeGreaterThan(0)
    })
  })

  it('zero-pads ISO numeric ids and includes microstates like Monaco', () => {
    const monacoFeature = features.find((feature) => feature.name === 'Monaco')
    expect(monacoFeature?.ccn3).toBe('492')

    const algeriaFeature = features.find((feature) => feature.name === 'Algeria')
    expect(algeriaFeature?.ccn3).toBe('012')
  })
})

describe('metricValue', () => {
  it('returns population for the population metric', () => {
    expect(metricValue(japan, 'population')).toBe(japan.population)
  })

  it('returns population density for the density metric', () => {
    expect(metricValue(monaco, 'density')).toBeCloseTo(monaco.population / monaco.area)
  })
})

describe('buildCountryValueIndex', () => {
  it('indexes countries by ccn3, skipping entries without a code', () => {
    const noCodeCountry = { ...japan, name: { common: 'No Code' }, ccn3: undefined }
    const index = buildCountryValueIndex([japan, monaco, noCodeCountry], 'population')

    expect(index.size).toBe(2)
    expect(index.get('392')?.country.name.common).toBe('Japan')
    expect(index.get('492')?.country.name.common).toBe('Monaco')
  })
})

describe('getValueRange', () => {
  it('returns min/max across the given values', () => {
    expect(getValueRange([japan.population, monaco.population, india.population])).toEqual({
      min: monaco.population,
      max: india.population,
    })
  })

  it('returns zeroes for an empty list', () => {
    expect(getValueRange([])).toEqual({ min: 0, max: 0 })
  })
})

describe('colorForValue', () => {
  it('returns the low-end color at the minimum', () => {
    expect(colorForValue(0, 0, 100)).toBe('#e0e7ff')
  })

  it('returns the high-end color at the maximum', () => {
    expect(colorForValue(100, 0, 100)).toBe('#312e81')
  })

  it('returns the high-end color when min equals max', () => {
    expect(colorForValue(50, 50, 50)).toBe('#312e81')
  })

  it('is distinct from the unmatched fill color', () => {
    expect(colorForValue(50, 0, 100)).not.toBe(MAP_UNMATCHED_FILL)
  })
})
