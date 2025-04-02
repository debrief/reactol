import { test } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Sample plot' }).click()
  await page.getByRole('textbox').fill('add zone')
  await page.getByRole('textbox').press('Enter')

  await page.waitForTimeout(100)

  const newZone = 'New Polygon'
  // collapse the `Units` node
  const unitsNode = page.locator('span:has-text("Units")').first()
  await unitsNode.click({ force: true })
  await page.getByRole('treeitem', { name: 'plus-square plus-circle Zones' }).locator('svg').nth(1).click()
  await page.getByText('Polygon').click()
  await page.getByRole('textbox', { name: '* Name :' }).click()
  await page.getByRole('textbox', { name: '* Name :' }).fill(newZone)
  await page.getByRole('button', { name: 'Create' }).click()
  await page.waitForTimeout(100)
  await page.getByRole('tree').getByText('Zones').click()
  await page.waitForTimeout(100)
  await page.getByRole('tree').getByText(newZone).click()
})