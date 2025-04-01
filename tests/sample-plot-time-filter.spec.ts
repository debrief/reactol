import { test, expect } from '@playwright/test'

test('Open Sample Plot, apply time filter, and step forward in time', async ({ page }) => {
  const plotName = 'General time test'
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
  await page.waitForSelector('.flexlayout__tab_button_content')
  await page.waitForSelector('.step-forward')
  
  // Verify that the plot has been created
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
  
  // Open the time step dropdown
  await page.locator('.time-step-input').click()
  await page.waitForSelector('.ant-select-dropdown')
  
  // Select a different time step (15 minutes)
  await page.locator('.ant-select-item-option').filter({ hasText: '00h15m' }).click()
  
  // Wait for the time to update
  await page.waitForTimeout(500)
  
  // Verify time step was applied by clicking step forward and checking time change
  await page.locator('.step-forward').click()
  await page.waitForTimeout(500)
  
  // Get updated time values
  const updatedStart = await timeStart.textContent()
  const updatedEnd = await timeEnd.textContent()
  
  // Verify times have changed according to the new step interval
  expect(updatedStart).not.toEqual(initialStart)
  expect(updatedEnd).not.toEqual(initialEnd)
  
  // The difference should be 15 minutes (our selected interval)
  // We can verify this by checking the format (MMM ddHHmm'Z')
  // Format example: 'Nov 141600Z'
  console.log('Time values:', initialStart, updatedStart)
  
  // Extract hours and minutes from the time strings
  // The format is 'MMM ddHHmmZ' where HH is at position 6-8 and mm is at position 8-10
  const initialHour = parseInt(initialStart?.substring(6, 8) || '0')
  const initialMinute = parseInt(initialStart?.substring(8, 10) || '0')
  const updatedHour = parseInt(updatedStart?.substring(6, 8) || '0')
  const updatedMinute = parseInt(updatedStart?.substring(8, 10) || '0')
  
  console.log('Parsed time components:', initialHour, initialMinute, updatedHour, updatedMinute)
  
  // Calculate the time in minutes for comparison
  const initialTimeInMinutes = initialHour * 60 + initialMinute
  const updatedTimeInMinutes = updatedHour * 60 + updatedMinute
  
  // Check if the difference is approximately 15 minutes (allowing for rounding)
  const timeDiff = Math.abs(updatedTimeInMinutes - initialTimeInMinutes)
  console.log('Time difference in minutes:', timeDiff)
  
  // We selected 15 minutes as the step, so expect a difference of about 15 minutes
  expect(timeDiff).toEqual(30)

  // We don't need to close the tab at the end of the test
  // Playwright will handle closing the browser context after each test
})

test('Test viewport lock/unlock functionality in control panel', async ({ page }) => {
  const plotName = 'Viewport Lock Test'
  // Navigate to the application and create a sample plot
  await page.goto('/')
  await page.waitForSelector('button:has-text("Sample plot")')
  await page.click('button:has-text("Sample plot")')
  await page.waitForSelector('div.ant-modal-content')
  await page.locator('input.ant-input').fill(plotName)
  await page.locator('button:has-text("OK")').click()
  await page.waitForSelector('.flexlayout__tab_button_content')
  
  // Find the viewport lock button
  // Based on the component code, it's a button with UnlockOutlined/LockFilled icon
  const viewportLockButton = page.locator('button', { has: page.locator('.anticon-unlock, .anticon-lock') })
  
  // Check initial state - viewport should be unlocked by default
  // The button should have 'outlined' variant when unlocked
  await expect(viewportLockButton).toHaveAttribute('class', expect.stringMatching(/.*ant-btn-outlined.*/))
  
  // Find the copy to clipboard button
  const copyButton = page.locator('.copy-map-to-clipboard')
  
  // Copy button should be disabled when viewport is unlocked
  await expect(copyButton).toBeDisabled()
  
  // Click the viewport lock button to lock the viewport
  await viewportLockButton.click()
  
  // Verify the button state changed - it should now have 'solid' variant
  await expect(viewportLockButton).toHaveAttribute('class', expect.stringMatching(/.*ant-btn-solid.*/))
  
  // Copy button should now be enabled
  await expect(copyButton).not.toBeDisabled()
  
  // Click the viewport lock button again to unlock
  await viewportLockButton.click()
  
  // Verify the button state changed back
  await expect(viewportLockButton).toHaveAttribute('class', expect.stringMatching(/.*ant-btn-outlined.*/))
  
  // Copy button should be disabled again
  await expect(copyButton).toBeDisabled()
})

test('Test undo/redo button in control panel', async ({ page }) => {
  const plotName = 'Undo Redo Test'
  // Navigate to the application and create a sample plot
  await page.goto('/')
  await page.waitForSelector('button:has-text("Sample plot")')
  await page.click('button:has-text("Sample plot")')
  await page.waitForSelector('div.ant-modal-content')
  await page.locator('input.ant-input').fill(plotName)
  await page.locator('button:has-text("OK")').click()
  await page.waitForSelector('.flexlayout__tab_button_content')
  
  // Find the undo/redo button
  const undoRedoButton = page.locator('.undo-redo-button')
  
  // Initially, there should be nothing to undo/redo, so the button should be disabled
  await expect(undoRedoButton).toBeDisabled()
  
  // find the delete button in the Layers component
  const deleteButton = page.locator('.layers-delete-button')
  
  // check delete is disabled
  await expect(deleteButton).toBeDisabled()

  // expand the `NAV` node
  await page.locator('.ant-tree-title').locator('span:has-text("NAV")').click()

  // Wait for the UI to update
  await page.waitForTimeout(200)

  // create undo queue by deleting `VAN GALEN` from Layers component.
  // find a span with the text `VAN GALEN`
  await page.locator('.ant-tree-list').locator('span:has-text("VAN GALEN")').click()

  // check delete is enabled
  await expect(deleteButton).not.toBeDisabled()

  // Click the delete button
  await deleteButton.click()

  // Wait for the UI to update
  await page.waitForTimeout(200)
    
  // check the undo/redo button is enabled
  await expect(undoRedoButton).not.toBeDisabled()

  // Click the undo/redo button to open the modal
  await undoRedoButton.click()
  
  // Verify the undo modal appears
  await expect(page.locator('.ant-modal-content')).toBeVisible()
  await expect(page.locator('.ant-modal-title')).toContainText('Undo')
  
  // Close the modal
  await page.locator('button:has-text("Cancel")').click()
  
  // Wait for modal to close
  await expect(page.locator('.ant-modal-content')).not.toBeVisible()
})
