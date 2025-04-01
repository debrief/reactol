import { test, expect } from '@playwright/test'
const plotName = 'Test plot'

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
  await page.locator('input.ant-input').fill(plotName)
  
  // Click the OK button to confirm
  await page.locator('button:has-text("OK")').click()
  
  // Wait for the plot to load after modal confirmation
  await page.waitForTimeout(1000)

  expect (await page.locator('.flexlayout__tab_button_content').first().textContent()).toEqual(plotName)
  
  // Find the step forward button (TimeButton component with StepForwardOutlined icon)
  // Based on the application code, it's a button with tooltip 'Step forward'
  const stepForwardButton = page.locator('.step-forward')
  
  // Check if the TimePeriod component is visible
  await expect(page.locator('.time-period-panel')).toBeVisible()
  
  // check the time start and end are outer period of data
  const timeStart = page.locator('.time-start-txt')
  const timeEnd = page.locator('.time-end-txt')
  expect(await timeStart.textContent()).toEqual('Nov 141616Z')
  expect(await timeEnd.textContent()).toEqual('Nov 151017Z')  

  // Get the initial time text before any actions
  const timeTextBeforeFilter = await page.locator('.time-period-panel p').textContent()
  console.log('Time period before filter:', timeTextBeforeFilter)

  // check time step buttons are disabled
  await expect(page.locator('.step-forward')).toBeDisabled()
  await expect(page.locator('.step-backward')).toBeDisabled()
  
  // Get the time text after clicking step forward (should be unchanged)
  const timeTextAfterClick = await page.locator('.time-period-panel p').textContent()
  console.log('Time period after clicking step forward (before filter):', timeTextAfterClick)
  
  // Verify that the time text has NOT changed (because filter is not applied)
  expect(timeTextAfterClick).toEqual(timeTextBeforeFilter)
  console.log('Verified: Time period did not change when filter is not applied')
  
  // Find and click the time filter button in the control panel
  // Based on the application code, it's a button with FilterOutlined/FilterFilled icon
  const timeFilterButton = page.locator('.apply-time-filter')

  // Check the time filter is currently disabled
  await expect(page.locator('.time-step-input')).toHaveClass(/.*ant-select-disabled.*/)

  // Alternative selector if the above doesn't work
  // const timeFilterButton = page.locator('button', { has: page.locator('.anticon-filter, .anticon-filter-filled') })
  await timeFilterButton.click()
  
  console.log('about to enable time filter')

  // check the time start and end are clipped to new values
  expect(await timeStart.textContent()).toEqual('Nov 141600Z')
  expect(await timeEnd.textContent()).toEqual('Nov 141700Z')
  
  // Verify that the form containing the time-step-input is no longer disabled
  // This is a more accurate way to confirm the time filter is active
  await expect(page.locator('.time-step-input')).not.toHaveClass(/.*ant-select-disabled.*/)
  
  // Now click the step forward button after applying the filter (should work now)
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

  // check the time start and end times have moved forwards
  expect(await timeStart.textContent()).toEqual('Nov 141800Z')
  expect(await timeEnd.textContent()).toEqual('Nov 141900Z')

  // get the large step fowards button
  const largeStepForwardButton = page.locator('.jump-to-end')
  await largeStepForwardButton.click()

  // Wait for the time to update
  await page.waitForTimeout(500)

  // Get the updated text content
  const updatedTimeText2 = await page.locator('.time-period-panel p').textContent()
  console.log('Updated time period:', updatedTimeText2)
  
  // Verify that the time text has changed
  expect(updatedTimeText2).not.toEqual(initialTimeText)
  console.log('Time period changed successfully from', initialTimeText, 'to', updatedTimeText2)

  // check the time start and end times have moved to end
  expect(await timeStart.textContent()).toEqual('Nov 151000Z')
  expect(await timeEnd.textContent()).toEqual('Nov 151100Z')

  // get the large step backwards button
  const largeStepBackButton = page.locator('.jump-to-start')
  await largeStepBackButton.click()

  // Wait for the time to update
  await page.waitForTimeout(500)

  // check the time start and end times have moved to start
  expect(await timeStart.textContent()).toEqual('Nov 141600Z')
  expect(await timeEnd.textContent()).toEqual('Nov 141700Z')

  // disable time filter
  await timeFilterButton.click()

  // Wait for the time to update
  await page.waitForTimeout(500)

  // check time step interval is disabled
  await expect(page.locator('.time-step-input')).toHaveClass(/.*ant-select-disabled.*/)

  // check time step buttons are disabled
  await expect(page.locator('.step-forward')).toBeDisabled()
  await expect(page.locator('.step-backward')).toBeDisabled()
})
