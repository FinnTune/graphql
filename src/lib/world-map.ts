import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import { density, type Country } from '@/lib/country-data'

export const WORLD_MAP_WIDTH = 960
export const WORLD_MAP_HEIGHT = 500
export const WORLD_MAP_VIEWBOX = `0 0 ${WORLD_MAP_WIDTH} ${WORLD_MAP_HEIGHT}`

export type CountryFeature = {
  ccn3: string
  name: string
  path: string
}

export type MapMetric = 'population' | 'density'

type CountryProperties = { name: string }

export function projectWorldTopology(topology: Topology): CountryFeature[] {
  const countriesObject = topology.objects.countries as GeometryCollection<CountryProperties>
  const geojson = feature(topology, countriesObject)
  const projection = geoNaturalEarth1().fitSize([WORLD_MAP_WIDTH, WORLD_MAP_HEIGHT], geojson)
  const pathGenerator = geoPath(projection)

  return geojson.features
    .map((countryFeature) => ({
      ccn3: String(countryFeature.id ?? '').padStart(3, '0'),
      name: countryFeature.properties?.name ?? 'Unknown',
      path: pathGenerator(countryFeature) ?? '',
    }))
    .filter((mapped) => mapped.path.length > 0)
}

export function metricValue(country: Country, metric: MapMetric): number {
  return metric === 'density' ? density(country) : country.population
}

export function buildCountryValueIndex(
  countries: Country[],
  metric: MapMetric,
): Map<string, { country: Country; value: number }> {
  const index = new Map<string, { country: Country; value: number }>()

  countries.forEach((country) => {
    if (!country.ccn3) return
    index.set(country.ccn3, { country, value: metricValue(country, metric) })
  })

  return index
}

export function getValueRange(values: number[]): { min: number; max: number } {
  if (!values.length) return { min: 0, max: 0 }
  return { min: Math.min(...values), max: Math.max(...values) }
}

const MAP_COLOR_LOW: [number, number, number] = [224, 231, 255] // indigo-100
const MAP_COLOR_HIGH: [number, number, number] = [49, 46, 129] // indigo-900
export const MAP_UNMATCHED_FILL = '#e2e8f0' // slate-200

function toHex(channel: number): string {
  return Math.round(channel).toString(16).padStart(2, '0')
}

export type MapScale = 'linear' | 'log'

/**
 * Position of `value` between `min` and `max` as 0-1. Country populations
 * and densities span many orders of magnitude, so the map uses a log scale;
 * on a linear one nearly every country would look identical next to China.
 */
export function scalePosition(value: number, min: number, max: number, scale: MapScale = 'linear'): number {
  if (max <= min) return 1
  const useLog = scale === 'log' && min > 0 && value > 0
  const t = useLog
    ? (Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min))
    : (value - min) / (max - min)
  return Math.min(1, Math.max(0, t))
}

/** The value sitting at position `t` (0-1) of the scale; inverse of scalePosition. */
export function valueAtPosition(t: number, min: number, max: number, scale: MapScale = 'linear'): number {
  if (scale === 'log' && min > 0 && max > min) {
    return Math.exp(Math.log(min) + t * (Math.log(max) - Math.log(min)))
  }
  return min + t * (max - min)
}

export function colorForValue(value: number, min: number, max: number, scale: MapScale = 'linear'): string {
  const t = scalePosition(value, min, max, scale)
  const [r, g, b] = MAP_COLOR_LOW.map((channel, index) => channel + (MAP_COLOR_HIGH[index] - channel) * t)
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export const MIN_ZOOM = 1
export const MAX_ZOOM = 8

export type MapView = { zoom: number; x: number; y: number }

export const DEFAULT_MAP_VIEW: MapView = { zoom: 1, x: 0, y: 0 }

/** Keeps the zoomed map covering the whole viewport (no empty margins). */
export function clampMapView(view: MapView): MapView {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.zoom))
  return {
    zoom,
    x: Math.min(0, Math.max(WORLD_MAP_WIDTH * (1 - zoom), view.x)),
    y: Math.min(0, Math.max(WORLD_MAP_HEIGHT * (1 - zoom), view.y)),
  }
}

/** Zooms to `nextZoom` keeping the viewport point (px, py) fixed on screen. */
export function zoomMapView(
  view: MapView,
  nextZoom: number,
  px = WORLD_MAP_WIDTH / 2,
  py = WORLD_MAP_HEIGHT / 2,
): MapView {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom))
  const ratio = zoom / view.zoom
  return clampMapView({ zoom, x: px - (px - view.x) * ratio, y: py - (py - view.y) * ratio })
}
