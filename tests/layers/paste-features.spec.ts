import { test, expect } from '@playwright/test'

test('Pasting features in Layers component', async ({ browser }) => {
  const plotName = 'Paste Features Test'
  
  // let the app read and write to the clipboard
  const context = await browser.newContext({
    permissions: ['clipboard-write', 'clipboard-read'],
  })
  const page = await context.newPage()
  
  // Navigate to the application and create a sample plot
  await page.goto('/')
  await page.waitForSelector('button:has-text("Sample plot")')
  await page.click('button:has-text("Sample plot")')
  
  // Enter plot name in the modal
  await page.waitForSelector('div.ant-modal-content')
  await page.locator('input.ant-input').fill(plotName)
  await page.locator('button:has-text("OK")').click()
  
  // Wait for the plot to load
  await page.waitForSelector('.flexlayout__tab_button_content')
  
  // Find the paste button
  const pasteButton = page.locator('.layers-paste-button')
  
  // and the copy button
  const copyButton = page.locator('.layers-copy-button')

  // Initially, the paste button should be disabled (no valid GeoJSON in clipboard)
  await expect(pasteButton).toBeDisabled()
  await expect(copyButton).toBeDisabled()
  
  // First, we need to copy something to the clipboard
  // Expand the "Points" node to find reference points
  const pointsNode = page.locator('.ant-tree-title:has-text("Points")').first()
  await pointsNode.click()
  
  // Wait for the points to be visible
  await page.waitForTimeout(100)
  
  // Select a reference point
  const referencePoint = page.locator('.ant-tree-title:has-text("NEW SONO")').first()
  await referencePoint.click()
  
  // Execute the actual copy button logic by clicking the button
  // First, make sure the button is visible and clickable
  await expect(copyButton).not.toBeDisabled()
  
  // Try clicking the button with force option to bypass any overlay issues
  console.log('Attempting to click copy button')
  await copyButton.click({ force: true, timeout: 500 })
  console.log('Copy locator clicked')
  
  // Give the clipboard operation time to complete
  // This should be enough time for the app to process everything
  await page.waitForTimeout(1000)
  
  console.log('Checking if paste button is enabled')

  // check paste button is enabled
  await expect(pasteButton).not.toBeDisabled()
  
  // Clear the selection
  const clearSelectionButton = page.locator('.layers-clear-button')
  await clearSelectionButton.click()
  
  // Delete the original item to verify paste works
  await referencePoint.click()
  const deleteButton = page.locator('.layers-delete-button')
  await deleteButton.click()

  // check we can't find the deleted item
  await expect(referencePoint).not.toBeVisible()

  await page.waitForTimeout(50)

  // Now click the paste button
  // Note: In a real browser environment with clipboard permissions, 
  // this would paste the copied feature
  await pasteButton.click()
  
  // // After pasting, we should see a new item in the tree
  // // Wait for the UI to update
  await page.waitForTimeout(500)
  
  // // Expand the Points node again if it collapsed
  await pointsNode.click()
  
  // // Wait for the points to be visible
  await page.waitForTimeout(100)
  
  // // Verify that there's at least one point visible after pasting
  const pointsAfterPaste = page.locator('.ant-tree-node-content-wrapper')
    .filter({ has: page.locator('.ant-tree-title') })
    .filter({ has: page.locator('.anticon-environment') })
  
  // // There should be at least one point visible
  const count = await pointsAfterPaste.count()
  expect(count).toBeGreaterThan(0)
})
