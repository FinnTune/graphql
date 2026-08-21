import '@testing-library/jest-dom/vitest'
import React from 'react'
import { beforeEach, vi } from 'vitest'

// Recharts' ResponsiveContainer needs all three of these under jsdom, which
// implements none of them: ResizeObserver to detect size changes, a non-zero
// getBoundingClientRect so it doesn't render a 0x0 chart, and non-zero
// offsetWidth/offsetHeight so axis tick labels measure as fitting (jsdom
// never performs real layout, so these are normally always 0/undefined).
// Re-applied before every test, not just once at file load, since some other
// test file's DOM/global cleanup has been observed to undo a one-time setup.
function installRechartsJsdomPolyfills() {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver

  Element.prototype.getBoundingClientRect = () => ({
    width: 600,
    height: 300,
    top: 0,
    left: 0,
    bottom: 300,
    right: 600,
    x: 0,
    y: 0,
    toJSON() {},
  })

  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 100 })
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 20 })
}

installRechartsJsdomPolyfills()
beforeEach(installRechartsJsdomPolyfills)

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string
    alt: string
    width?: number
    height?: number
    className?: string
  }) => React.createElement('img', { src, alt, width, height, className }),
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => React.createElement('a', { href, className }, children),
}))
