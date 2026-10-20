'use client'

import { useMemo, useRef, useState, type PointerEvent } from 'react'
import type { Topology } from 'topojson-specification'
import worldTopology from '@/data/world-countries-50m.json'
import { formatCompact, formatNumber, type Country } from '@/lib/country-data'
import {
  buildCountryValueIndex,
  clampMapView,
  colorForValue,
  DEFAULT_MAP_VIEW,
  getScaleRange,
  MAP_UNMATCHED_FILL,
  MAX_ZOOM,
  MIN_ZOOM,
  projectWorldTopology,
  valueAtPosition,
  WORLD_MAP_HEIGHT,
  WORLD_MAP_VIEWBOX,
  WORLD_MAP_WIDTH,
  zoomMapView,
  type MapMetric,
  type MapView,
} from '@/lib/world-map'

const METRIC_LABELS: Record<MapMetric, string> = {
  population: 'Population',
  density: 'Density',
}

const METRIC_UNITS: Record<MapMetric, string> = {
  population: '',
  density: '/km2',
}

const ZOOM_STEP = 1.5
// Pointer movement (px) beyond which a press counts as a drag, not a click.
const DRAG_THRESHOLD = 4

type WorldMapProps = {
  countries: Country[]
  selectedCountry: string | null
  onSelectCountry: (name: string) => void
}

type Hover = { name: string; value: number; x: number; y: number }

const CONTROL_BUTTON =
  'rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800'

export default function WorldMap({ countries, selectedCountry, onSelectCountry }: WorldMapProps) {
  const [metric, setMetric] = useState<MapMetric>('population')
  const [view, setView] = useState<MapView>(DEFAULT_MAP_VIEW)
  const [hover, setHover] = useState<Hover | null>(null)

  const frameRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startX: number; startY: number; view: MapView; moved: boolean } | null>(null)
  // Set after a drag so the click that follows the pointer release doesn't
  // select whichever country the cursor ended up over.
  const suppressClick = useRef(false)

  const features = useMemo(() => projectWorldTopology(worldTopology as unknown as Topology), [])
  const valueIndex = useMemo(() => buildCountryValueIndex(countries, metric), [countries, metric])
  const { min, max } = useMemo(
    () => getScaleRange(Array.from(valueIndex.values()).map((entry) => entry.value)),
    [valueIndex],
  )

  const unit = METRIC_UNITS[metric]
  const isZoomed = view.zoom > MIN_ZOOM

  function setZoom(nextZoom: number) {
    setView((current) => zoomMapView(current, nextZoom))
  }

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0 || !isZoomed) return
    drag.current = { startX: event.clientX, startY: event.clientY, view, moved: false }
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const frame = frameRef.current?.getBoundingClientRect()

    const current = drag.current
    if (current && frame && frame.width > 0) {
      const dx = event.clientX - current.startX
      const dy = event.clientY - current.startY
      if (current.moved || Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        current.moved = true
        setHover(null)
        // Convert screen pixels to viewBox units.
        const scale = WORLD_MAP_WIDTH / frame.width
        setView(
          clampMapView({ ...current.view, x: current.view.x + dx * scale, y: current.view.y + dy * scale }),
        )
        return
      }
    }

    // Keep an already-showing tooltip glued to the pointer.
    if (frame) {
      setHover((previous) =>
        previous ? { ...previous, x: event.clientX - frame.left, y: event.clientY - frame.top } : previous,
      )
    }
  }

  function endDrag() {
    suppressClick.current = Boolean(drag.current?.moved)
    drag.current = null
    // The flag only needs to survive until the click event fired by this
    // same pointer release.
    if (suppressClick.current) setTimeout(() => (suppressClick.current = false), 0)
  }

  function select(name: string) {
    if (suppressClick.current) return
    onSelectCountry(name)
  }

  const legendStops = [0, 0.5, 1].map((t) => valueAtPosition(t, min, max, 'log'))

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">World Map</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Click a highlighted country to see its details. Shading reflects your current filter.
          </p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Map color metric">
          {(Object.keys(METRIC_LABELS) as MapMetric[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={metric === option}
              onClick={() => setMetric(option)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                metric === option
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'
              }`}
            >
              {METRIC_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2" role="group" aria-label="Map zoom">
        <button
          type="button"
          className={CONTROL_BUTTON}
          aria-label="Zoom in"
          disabled={view.zoom >= MAX_ZOOM}
          onClick={() => setZoom(view.zoom * ZOOM_STEP)}
        >
          +
        </button>
        <button
          type="button"
          className={CONTROL_BUTTON}
          aria-label="Zoom out"
          disabled={view.zoom <= MIN_ZOOM}
          onClick={() => setZoom(view.zoom / ZOOM_STEP)}
        >
          &minus;
        </button>
        <button
          type="button"
          className={CONTROL_BUTTON}
          disabled={!isZoomed}
          onClick={() => setView(DEFAULT_MAP_VIEW)}
        >
          Reset
        </button>
        <span className="text-xs text-slate-600 dark:text-slate-400" aria-live="polite">
          {isZoomed ? `${view.zoom.toFixed(1)}x - drag to pan` : 'Use + to zoom in'}
        </span>
      </div>

      <div ref={frameRef} className="relative mt-3">
        <svg
          viewBox={WORLD_MAP_VIEWBOX}
          role="group"
          aria-label={`World map colored by ${METRIC_LABELS[metric].toLowerCase()}. Each highlighted country is a button.`}
          className={`h-auto w-full touch-pan-y select-none ${isZoomed ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={() => {
            drag.current = null
            setHover(null)
          }}
        >
          <g transform={`translate(${view.x} ${view.y}) scale(${view.zoom})`}>
            {features.map((countryFeature, index) => {
              const match = valueIndex.get(countryFeature.ccn3)
              const isSelected = match?.country.name.common === selectedCountry
              const fill = match ? colorForValue(match.value, min, max, 'log') : MAP_UNMATCHED_FILL
              const label = match
                ? `${match.country.name.common}: ${formatNumber(Math.round(match.value))}${unit}`
                : countryFeature.name

              return (
                <path
                  // A handful of territories share a missing or reused ISO
                  // numeric code (e.g. Kosovo/Somaliland both fall back to
                  // "000"), so ccn3/name aren't unique - index is, since
                  // `features` is a stable, memoized array.
                  key={index}
                  d={countryFeature.path}
                  fill={fill}
                  stroke={isSelected ? '#4f46e5' : '#ffffff'}
                  strokeWidth={isSelected ? 1.5 : 0.5}
                  // Keep outlines a constant on-screen width while zoomed.
                  vectorEffect="non-scaling-stroke"
                  role={match ? 'button' : undefined}
                  tabIndex={match ? 0 : undefined}
                  aria-label={match ? match.country.name.common : undefined}
                  aria-pressed={match ? isSelected : undefined}
                  onClick={match ? () => select(match.country.name.common) : undefined}
                  onPointerEnter={
                    match
                      ? (event) => {
                          if (drag.current?.moved) return
                          const frame = frameRef.current?.getBoundingClientRect()
                          setHover({
                            name: match.country.name.common,
                            value: match.value,
                            x: event.clientX - (frame?.left ?? 0),
                            y: event.clientY - (frame?.top ?? 0),
                          })
                        }
                      : undefined
                  }
                  onPointerLeave={match ? () => setHover(null) : undefined}
                  onKeyDown={
                    match
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            onSelectCountry(match.country.name.common)
                          }
                        }
                      : undefined
                  }
                  className={
                    match
                      ? 'cursor-pointer transition-opacity hover:opacity-80 focus:outline-none focus-visible:stroke-indigo-600 focus-visible:stroke-[2.5]'
                      : undefined
                  }
                >
                  <title>{label}</title>
                </path>
              )
            })}
          </g>
        </svg>

        {hover ? (
          <div
            role="presentation"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-lg dark:bg-slate-100 dark:text-slate-900"
            style={{ left: hover.x, top: hover.y - 12 }}
          >
            <span className="font-semibold">{hover.name}</span>: {formatNumber(Math.round(hover.value))}
            {unit}
          </div>
        ) : null}
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-medium text-indigo-700 dark:text-indigo-300">
          View map data as a table
        </summary>
        <div className="mt-2 max-h-64 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-white dark:bg-slate-900">
              <tr>
                <th scope="col" className="py-1 pr-4">
                  Country
                </th>
                <th scope="col" className="py-1">
                  {METRIC_LABELS[metric]}
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from(valueIndex.values())
                .sort((a, b) => b.value - a.value)
                .map(({ country, value }) => (
                  <tr key={country.name.common}>
                    <th scope="row" className="py-0.5 pr-4 font-normal">
                      {country.name.common}
                    </th>
                    <td className="py-0.5">
                      {formatNumber(Math.round(value))}
                      {unit}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="mt-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div
              className="h-2 rounded"
              style={{ background: 'linear-gradient(to right, #e0e7ff, #312e81)' }}
              aria-hidden="true"
            />
            {valueIndex.size > 0 ? (
              <div className="mt-1 flex justify-between" data-testid="map-legend">
                {legendStops.map((stop, index) => (
                  <span key={index}>
                    {index === 0 ? '≤' : index === legendStops.length - 1 ? '≥' : ''}
                    {formatCompact(stop)}
                    {unit}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
            {countries.length} countries in filter
          </span>
        </div>
        <p className="mt-1">Color scale is logarithmic so small and large countries stay distinguishable.</p>
      </div>
    </section>
  )
}
