import { describe, expect, it } from 'vitest'
import type { Topology } from 'topojson-specification'
import worldTopology from '@/data/world-countries-50m.json'
import { india, japan, monaco } from '@/test/fixtures/countries'
import {
  buildCountryValueIndex,
  clampMapView,
  colorForValue,
  DEFAULT_MAP_VIEW,
  getScaleRange,
  getValueRange,
  MAX_ZOOM,
  MIN_ZOOM,
  metricValue,
  projectWorldTopology,
  MAP_UNMATCHED_FILL,
  scalePosition,
  valueAtPosition,
  WORLD_MAP_HEIGHT,
  zoomMapView,
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

describe('log color scale', () => {
  it('spreads values across orders of magnitude instead of clustering them', () => {
    // On a linear scale 1,000 of 1,000,000 is ~0.1% of the way up; on a log
    // scale it is halfway, so mid-sized countries stay distinguishable.
    expect(scalePosition(1000, 1, 1_000_000, 'linear')).toBeLessThan(0.01)
    expect(scalePosition(1000, 1, 1_000_000, 'log')).toBeCloseTo(0.5, 1)
  })

  it('falls back to linear when the range includes zero or negatives', () => {
    expect(scalePosition(5, 0, 10, 'log')).toBe(0.5)
  })

  it('inverts scalePosition', () => {
    for (const scale of ['linear', 'log'] as const) {
      const value = valueAtPosition(0.25, 10, 10_000, scale)
      expect(scalePosition(value, 10, 10_000, scale)).toBeCloseTo(0.25, 5)
    }
  })

  it('uses the scale when coloring', () => {
    expect(colorForValue(1000, 1, 1_000_000, 'log')).not.toBe(colorForValue(1000, 1, 1_000_000, 'linear'))
  })
})

describe('map view', () => {
  it('clamps panning so the map always covers the viewport', () => {
    const clamped = clampMapView({ zoom: 2, x: 500, y: -9999 })

    expect(clamped.x).toBe(0)
    expect(clamped.y).toBe(WORLD_MAP_HEIGHT * (1 - 2))
  })

  it('clamps zoom to the allowed range', () => {
    expect(zoomMapView(DEFAULT_MAP_VIEW, 100).zoom).toBe(MAX_ZOOM)
    expect(zoomMapView(DEFAULT_MAP_VIEW, 0.1).zoom).toBe(MIN_ZOOM)
  })

  it('keeps the zoom anchor point stationary', () => {
    const anchorX = 300
    const view = zoomMapView(DEFAULT_MAP_VIEW, 2, anchorX, 100)

    // Screen position of a map point = view.x + mapX * zoom.
    const mapXUnderAnchor = (anchorX - DEFAULT_MAP_VIEW.x) / DEFAULT_MAP_VIEW.zoom
    expect(view.x + mapXUnderAnchor * view.zoom).toBeCloseTo(anchorX, 5)
  })

  it('returns to the default view when zoomed fully out', () => {
    const zoomedIn = zoomMapView(DEFAULT_MAP_VIEW, 4, 700, 300)

    expect(zoomMapView(zoomedIn, 1)).toEqual(DEFAULT_MAP_VIEW)
  })
})

describe('getScaleRange', () => {
  it('ignores extreme outliers at both ends', () => {
    const values = [1, ...Array.from({ length: 98 }, (_, i) => 1000 + i), 1_000_000_000]

    const { min, max } = getScaleRange(values)

    expect(min).toBeGreaterThanOrEqual(1000)
    expect(max).toBeLessThan(1_000_000_000)
  })

  it('matches the plain range for a handful of values', () => {
    expect(getScaleRange([5, 10, 20])).toEqual({ min: 5, max: 20 })
  })

  it('returns zeroes for an empty list', () => {
    expect(getScaleRange([])).toEqual({ min: 0, max: 0 })
  })
})
