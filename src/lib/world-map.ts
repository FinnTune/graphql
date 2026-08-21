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
  metric: MapMetric
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

export function colorForValue(value: number, min: number, max: number): string {
  const t = max > min ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 1
  const [r, g, b] = MAP_COLOR_LOW.map((channel, index) => channel + (MAP_COLOR_HIGH[index] - channel) * t)
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
