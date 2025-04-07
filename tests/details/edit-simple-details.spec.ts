import { test, expect } from '@playwright/test'

test('test editing feature', async ({ page }) => {
  const newName = 'VAN GALEN 2'
  await page.goto('/')
  await page.getByRole('button', { name: 'Sample plot' }).click()
  await page.getByRole('textbox').fill('edit tracks')
  await page.getByRole('textbox').press('Enter')
  await page.getByText('VAN GALEN').click()
  // check newly named item not present
  await expect(page.getByRole('tree').getByText(newName)).not.toBeVisible()
  await page.getByRole('textbox', { name: '* Name :' }).click()
  await page.getByRole('textbox', { name: '* Name :' }).fill(newName)
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByRole('tree').getByText(newName)).toBeVisible()
})
test('test adding feature', async ({ page }) => {
  const newName = 'Dummy Air'
  await page.goto('/')
  await page.getByRole('button', { name: 'Sample plot' }).click()
  await page.getByRole('textbox').fill('Add track')
  await page.getByRole('textbox').press('Enter')
  // check we can create a new air track
  await page.locator('.add-icon').first().click()
  // introduce pause
  await page.waitForTimeout(100)
  await page.waitForSelector('.create-track')
  await page.locator('.create-track').locator('.create-track-name').click() 
  await page.locator('.create-track').locator('.create-track-name').fill(newName)
  await page.locator('.create-track').locator('.create-track-name').press('Tab')
  await page.locator('.create-track').locator('.create-track-shortName').fill('DAIR')
  await page.locator('.create-track').locator('#createTrack_initialYear').click()
  await page.locator('.create-track').locator('.create-track-year').locator('.ant-input-number-handler-up').click()
  await page.locator('.create-track').locator('.create-track-year').locator('.ant-input-number-handler-up').click()
  await page.locator('.create-track-button').click()
  await page.waitForTimeout(100)
  await page.getByText('AIR').click()
  await expect(page.getByRole('tree').getByText(newName)).toBeVisible()
})