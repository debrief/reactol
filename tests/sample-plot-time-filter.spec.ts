import { test, expect } from '@playwright/test'

test('Open Sample Plot, apply time filter, and step forward in time', async ({ page }) => {
  // Navigate to the application
  await page.goto('/')
  
  // Wait for the application to load
  await page.waitForSelector('button:has-text("Sample plot")')
  
  // Click on Sample Plot button to create a new sample plot
  await page.click('button:has-text("Sample plot")')
  
  // Wait for the document name modal to appear
  await page.waitForSelector('div.ant-modal-content')
  
  // Enter a name for the document in the input field
  await page.locator('input.ant-input').fill('Test Plot')
  
  // Click the OK button to confirm
  await page.locator('button:has-text("OK")').click()
  
  // Wait for the plot to load after modal confirmation
  await page.waitForTimeout(2000)
  
  // Find and click the time filter button in the control panel
  // Based on the application code, it's a button with FilterOutlined/FilterFilled icon
  const timeFilterButton = page.locator('button:has(.anticon-filter), button:has(.anticon-filter-filled)')

  // Check the time filter is currently disabled
  await expect(page.locator('.time-step-input')).toHaveClass(/.*ant-select-disabled.*/)

  // Alternative selector if the above doesn't work
  // const timeFilterButton = page.locator('button', { has: page.locator('.anticon-filter, .anticon-filter-filled') })
  await timeFilterButton.click()
  
  
  // Verify that the form containing the time-step-input is no longer disabled
  // This is a more accurate way to confirm the time filter is active
  await expect(page.locator('.time-step-input')).not.toHaveClass(/.*ant-select-disabled.*/)
  
  // Find and click the step forward button (TimeButton component with StepForwardOutlined icon)
  // Based on the application code, it's a button with tooltip 'Step forward'
  const stepForwardButton = page.locator('button[title="Step forward"], [data-tooltip="Step forward"]')
  // Alternative selector targeting the icon
  // const stepForwardButton = page.locator('button:has(.anticon-step-forward)')
  await stepForwardButton.click()
  
  // Verify that the time has changed after stepping forward
  
  // Wait for any animations or updates to complete
  await page.waitForTimeout(500)
  
  // Now specifically check that the TimePeriod component is visible
  await expect(page.locator('.time-period-panel')).toBeVisible()
  
  // Get the text content of the TimePeriod before stepping forward
  const initialTimeText = await page.locator('.time-period-panel p').textContent()
  console.log('Initial time period:', initialTimeText)
  
  // Click the step forward button again
  await stepForwardButton.click()
  
  // Wait for the time to update
  await page.waitForTimeout(500)
  
  // Get the updated text content
  const updatedTimeText = await page.locator('.time-period-panel p').textContent()
  console.log('Updated time period:', updatedTimeText)
  
  // Verify that the time text has changed
  expect(updatedTimeText).not.toEqual(initialTimeText)
  console.log('Time period changed successfully from', initialTimeText, 'to', updatedTimeText)
})
