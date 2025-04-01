import { test } from '@playwright/test'

test('test', async ({ page }) => {
  const newZone = 'New Polygon'
  await page.goto('/')
  await page.getByRole('button', { name: 'Sample plot' }).click()
  await page.getByRole('textbox').fill('add zone')
  await page.getByRole('button', { name: 'OK' }).click()
  await page.getByRole('treeitem', { name: 'plus-square plus-circle Zones' }).locator('svg').nth(1).click()
  await page.getByText('Polygon').click()
  await page.getByRole('textbox', { name: '* Name :' }).click()
  await page.getByRole('textbox', { name: '* Name :' }).fill(newZone)
  await page.getByRole('button', { name: 'Create' }).click()
  await page.waitForTimeout(100)
  await page.getByRole('tree').getByText('Zones').click()
  await page.getByRole('tree').getByText(newZone).click()
})