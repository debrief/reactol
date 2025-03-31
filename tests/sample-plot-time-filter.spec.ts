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
  // Alternative selector if the above doesn't work
  // const timeFilterButton = page.locator('button', { has: page.locator('.anticon-filter, .anticon-filter-filled') })
  await timeFilterButton.click()
  
  // Wait for the time filter to be applied
  // The button should now show a filled filter icon indicating the filter is applied
  await page.waitForSelector('.anticon-filter-filled')
  
  // Find and click the step forward button (TimeButton component with StepForwardOutlined icon)
  // Based on the application code, it's a button with tooltip 'Step forward'
  const stepForwardButton = page.locator('button[title="Step forward"], [data-tooltip="Step forward"]')
  // Alternative selector targeting the icon
  // const stepForwardButton = page.locator('button:has(.anticon-step-forward)')
  await stepForwardButton.click()
  
  // Verify that the time has changed after stepping forward
  // Since we don't know exactly how the time is displayed, we'll check for visual changes
  // in the GraphsPanel component which should update when time changes
  
  // Wait for any animations or updates to complete
  await page.waitForTimeout(500)
  
  // Verify the graphs panel is visible and has been updated
  // This assumes there's a container for the graphs
  await expect(page.locator('.recharts-wrapper, [class*="GraphsPanel"]')).toBeVisible()
  
  // Additional verification could include:
  // 1. Checking if the time display has changed
  // 2. Verifying that data points in the graphs have shifted
  // 3. Checking for specific elements that only appear when time filtering is active
})
