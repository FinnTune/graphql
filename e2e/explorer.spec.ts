import { expect, test } from '@playwright/test'

test.describe('explorer', () => {
  test('server-renders the dashboard for the URL state', async ({ request }) => {
    const response = await request.get('/explore?region=Europe&sort=name')
    const html = await response.text()

    expect(response.ok()).toBe(true)
    expect(html).toContain('Global Population Explorer')
    expect(html).toContain('France')
    expect(html).not.toContain('Loading global data')
  })

  test('filter, sort, and compare state survives a reload via the URL', async ({ page }) => {
    await page.goto('/explore')
    await expect(page.getByRole('heading', { name: 'Global Population Explorer' })).toBeVisible()

    await page.getByLabel('Filter by region').selectOption('Europe')
    await page.getByLabel('Sort countries').selectOption('name')
    await page.getByPlaceholder(/search by country or capital/i).fill('ice')

    await expect(page).toHaveURL(/region=Europe/)
    await expect(page).toHaveURL(/sort=name/)
    await expect(page).toHaveURL(/q=ice/)

    const cards = page.getByRole('heading', { level: 3 })
    await expect(cards.first()).toHaveText('Iceland')
    await expect(page.getByRole('heading', { name: 'Japan', level: 3 })).toHaveCount(0)

    await page.reload()

    await expect(page.getByLabel('Filter by region')).toHaveValue('Europe')
    await expect(page.getByLabel('Sort countries')).toHaveValue('name')
    await expect(page.getByPlaceholder(/search by country or capital/i)).toHaveValue('ice')
    await expect(cards.first()).toHaveText('Iceland')
  })

  test('selecting a country on the lazily-loaded map shows its details', async ({ page }) => {
    await page.goto('/explore')

    await page.getByRole('button', { name: 'Japan', exact: true }).click()

    await expect(page.getByText('Capital: Tokyo').first()).toBeVisible()
  })

  test('the map zooms, pans, and shows a tooltip on hover', async ({ page }) => {
    await page.goto('/explore')
    const group = page.locator('svg > g').first()
    await expect(group).toHaveAttribute('transform', 'translate(0 0) scale(1)')

    await page.getByRole('button', { name: 'Zoom in' }).click()
    await page.getByRole('button', { name: 'Zoom in' }).click()
    await expect(group).toHaveAttribute('transform', /scale\(2\.25\)/)

    const svg = page.getByRole('group', { name: /world map/i })
    const box = (await svg.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 - 120, box.y + box.height / 2 - 40, { steps: 5 })
    await page.mouse.up()
    await expect(group).not.toHaveAttribute('transform', /translate\(-?0 -?0\)/)

    await page.getByRole('button', { name: 'Reset' }).click()
    await expect(group).toHaveAttribute('transform', 'translate(0 0) scale(1)')

    await page.getByRole('button', { name: 'Japan', exact: true }).hover()
    await expect(page.getByRole('presentation').filter({ hasText: 'Japan:' })).toBeVisible()
  })

  test('the old /profile URL redirects to /explore and keeps the query string', async ({ page }) => {
    await page.goto('/profile?region=Asia')

    await expect(page).toHaveURL(/\/explore\?region=Asia/)
    await expect(page.getByLabel('Filter by region')).toHaveValue('Asia')
  })
})

test.describe('graphql api (production hardening)', () => {
  const post = (request: import('@playwright/test').APIRequestContext, query: string) =>
    request.post('/api/graphql', { data: { query } })

  test('answers filtered queries', async ({ request }) => {
    const response = await post(request, '{ countries(region: "Oceania", limit: 1) { name { common } } }')
    const json = await response.json()

    expect(json.data.countries).toHaveLength(1)
  })

  test('lets successful GET queries be cached and POSTs not', async ({ request }) => {
    const query = encodeURIComponent('{ regions }')
    const get = await request.get(`/api/graphql?query=${query}`)
    expect(get.headers()['cache-control']).toContain('s-maxage=3600')

    const postResponse = await post(request, '{ regions }')
    expect(postResponse.headers()['cache-control'] ?? '').not.toContain('s-maxage')
  })

  test('has introspection disabled', async ({ request }) => {
    const response = await post(request, '{ __schema { types { name } } }')
    const json = await response.json()

    expect(json.errors?.[0]?.message).toMatch(/introspection has been disabled/i)
  })

  test('rejects over-deep queries', async ({ request }) => {
    const nested = Array.from({ length: 10 }).reduce<string>((inner) => `a { ${inner} }`, 'b')
    const response = await post(request, `{ ${nested} }`)
    const json = await response.json()

    expect(JSON.stringify(json.errors)).toMatch(/depth/i)
  })
})
