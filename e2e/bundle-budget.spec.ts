import { gzipSync } from 'node:zlib'
import { expect, test } from '@playwright/test'

// Gzipped JS the browser must download for /explore before it is interactive.
// Measured at ~290 KB when this budget was set; raise it deliberately, not
// accidentally, when a feature genuinely needs more.
const INITIAL_JS_BUDGET_KB = 350

test.describe('performance budget', () => {
  test('keeps the initial /explore JavaScript within budget and the world map out of it', async ({
    request,
  }) => {
    const html = await (await request.get('/explore')).text()
    const scripts = [...html.matchAll(/<script[^>]*\ssrc="([^"]+\.js[^"]*)"/g)].map((match) => match[1])
    expect(scripts.length).toBeGreaterThan(0)

    let gzippedBytes = 0
    for (const src of scripts) {
      const body = await (await request.get(src)).body()
      gzippedBytes += gzipSync(body).length

      // The ~750 KB world topology must only arrive via the lazy-loaded map.
      expect(body.toString('utf8'), `${src} should not contain the world topology`).not.toContain(
        '"Topology"',
      )
    }

    const kilobytes = gzippedBytes / 1024
    expect(kilobytes, `initial JS is ${kilobytes.toFixed(0)} KB gzipped`).toBeLessThan(INITIAL_JS_BUDGET_KB)
  })
})
