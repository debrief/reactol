import { test, expect } from '@playwright/test'

test('Test time step interval selection in control panel', async ({ page }) => {
  const plotName = 'Time Step Interval Test'
  // Navigate to the application and create a sample plot
  await page.goto('/')
  await page.waitForSelector('button:has-text("Sample plot")')
  await page.click('button:has-text("Sample plot")')
  await page.waitForSelector('div.ant-modal-content')
  await page.locator('input.ant-input').fill(plotName)
  await page.locator('button:has-text("OK")').click()
  await page.waitForSelector('.flexlayout__tab_button_content')
  await page.waitForSelector('.step-forward')
  
  // Apply time filter to enable time controls
  const timeFilterButton = page.locator('.apply-time-filter')
  await timeFilterButton.click()
  
  // Wait for time controls to be enabled
  await expect(page.locator('.time-step-input')).not.toHaveClass(/.*ant-select-disabled.*/)
  
  // Get initial time values
  const timeStart = page.locator('.time-start-txt')
  const timeEnd = page.locator('.time-end-txt')
  const initialStart = await timeStart.textContent()
  const initialEnd = await timeEnd.textContent()
  
  // Wait for the time to update
  await page.waitForTimeout(200)

  // Open the time step dropdown
  await page.locator('.time-step-input').click()
  await page.waitForSelector('.ant-select-dropdown')
  
  // Select a different time step (15 minutes)
  await page.locator('.ant-select-item-option').filter({ hasText: '00h15m' }).click()
  
  // Wait for the time to update
  await page.waitForTimeout(500)

  // Get updated time values
  const trimmedStart = await timeStart.textContent()
  const trimmedEnd = await timeEnd.textContent()
  expect(trimmedStart).toEqual('Nov 141615Z')
  expect(trimmedEnd).toEqual('Nov 141630Z')
  
  // Verify time step was applied by clicking step forward and checking time change
  await page.locator('.step-forward').click()
  await page.waitForTimeout(500)
  
  // Get updated time values
  const updatedStart = await timeStart.textContent()
  const updatedEnd = await timeEnd.textContent()
  
  // Verify times have changed according to the new step interval
  expect(updatedStart).not.toEqual(initialStart)
  expect(updatedEnd).not.toEqual(initialEnd)

  expect(updatedStart).toEqual('Nov 141630Z')
  expect(updatedEnd).toEqual('Nov 141645Z')
  
  
  // The difference should be 15 minutes (our selected interval)
  // We can verify this by checking the format (MMM ddHHmm'Z')
  // Format example: 'Nov 141600Z'

  
  // Extract hours and minutes from the time strings
  // The format is 'MMM ddHHmmZ' where HH is at position 6-8 and mm is at position 8-10
  const initialHour = parseInt(trimmedStart?.substring(6, 8) || '0')
  const initialMinute = parseInt(trimmedStart?.substring(8, 10) || '0')
  const updatedHour = parseInt(updatedStart?.substring(6, 8) || '0')
  const updatedMinute = parseInt(updatedStart?.substring(8, 10) || '0')
  

  
  // Calculate the time in minutes for comparison
  const initialTimeInMinutes = initialHour * 60 + initialMinute
  const updatedTimeInMinutes = updatedHour * 60 + updatedMinute
  
  // Check if the difference is approximately 15 minutes (allowing for rounding)
  const timeDiff = Math.abs(updatedTimeInMinutes - initialTimeInMinutes)

  
  // We selected 15 minutes as the step, so expect a difference of about 15 minutes
  expect(timeDiff).toEqual(15)

  // We don't need to close the tab at the end of the test
  // Playwright will handle closing the browser context after each test
})
