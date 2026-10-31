import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`accessibility (${colorScheme})`, () => {
    test.use({ colorScheme })

    test('/explore has no WCAG A/AA violations', async ({ page }) => {
      await page.goto('/explore')
      await expect(page.getByRole('heading', { name: 'Global Population Explorer' })).toBeVisible()
      // Wait for the lazy map so it is part of the scan.
      await expect(page.getByRole('button', { name: 'Japan', exact: true })).toBeVisible()

      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()

      expect(
        violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes) e.g. ${v.nodes[0]?.target}`),
      ).toEqual([])
    })
  })
}
