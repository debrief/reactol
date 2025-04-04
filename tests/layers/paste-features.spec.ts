import { test, expect } from '@playwright/test'

// Declare the testHelper interface for TypeScript
declare global {
  interface Window {
    testHelper?: {
      setClipboardWithValidGeoJSON: () => Promise<boolean>
    }
  }
}

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

  // collapse the Units node
  const unitsNode = page.locator('.ant-tree-title:has-text("Units")').first()
  await unitsNode.click()

  
  // Find the paste button
  const pasteButton = page.locator('.layers-paste-button')
  expect(await pasteButton.count()).toBe(1)
  
  // and the copy button
  const copyButton = page.locator('.layers-copy-button')

  // Initially, the paste button should be disabled (no valid GeoJSON in clipboard)
  // await expect(pasteButton).toBeDisabled()
  await expect(copyButton).toBeDisabled()
  
  // First, we need to copy something to the clipboard
  // Expand the "Points" node to find reference points
  const pointsNode = page.locator('.ant-tree-title:has-text("Points")').first()
  await pointsNode.click()
  
  // Wait for the points to be visible
  await page.waitForTimeout(100)
  
  // Select a reference point
  const referencePoint = page.locator('.ant-tree-title:has-text("NEW SONO")').first()
  if (!await referencePoint.isVisible()) {
    await pointsNode.click()
    await page.waitForTimeout(100)
  }
  await referencePoint.click()

  await copyButton.click()

  await page.waitForTimeout(100)

  // now delete the `NEW SONO` point
  const deleteButton = page.locator('.layers-delete-button').first()
  await deleteButton.click()

  // check item got disabled
  const refAfterPaste = page.locator('.ant-tree-title:has-text("NEW SONO")').first()
  await expect(refAfterPaste).not.toBeVisible()
  
  // check paste button is enabled
  await expect(pasteButton).not.toBeDisabled()

  // Now click the paste button
  // Note: In a real browser environment with clipboard permissions, 
  // this would paste the copied feature
  expect(await pasteButton.isVisible()).toBeTruthy()
  expect(await pasteButton.isEnabled()).toBeTruthy()
  await pasteButton.click({ force: true })

  await page.waitForTimeout(100)

  // check paste disabled
  await expect(pasteButton).toBeDisabled()
  
  // // After pasting, we should see a new item in the tree
  // // Wait for the UI to update
  await page.waitForTimeout(500)
  
  // // Expand the Points node again if it collapsed
  await pointsNode.click()
  
  // // Wait for the points to be visible
  await page.waitForTimeout(100)
  
  // if points is collapsed
  const pointsAfterPaste = page.locator('span:has-text("NEW SONO")').first()
  if (!await pointsNode.isVisible()) {
    await pointsNode.click()
    await page.waitForTimeout(100)
  }

  // // Verify that there's at least one point visible after pasting
  await expect(pointsAfterPaste).toBeVisible()
})
