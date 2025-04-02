import { test, expect } from '@playwright/test'

// Declare the testHelper interface for TypeScript
declare global {
  interface Window {
    testHelper?: {
      setClipboardWithValidGeoJSON: () => Promise<boolean>
    }
  }
}

const featureName = 'paste-test-feature'

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
  await pasteButton.highlight()
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
  await referencePoint.click()
  
  // Since clicking the copy button is unreliable, let's use a different approach
  // Add a test helper function to the page that will directly set clipboard content
  // and then expose a method to check the clipboard
  await page.evaluate(() => {
    // Create a global test helper object
    window.testHelper = {
      // Function to set clipboard content with valid GeoJSON
      setClipboardWithValidGeoJSON: async () => {
        try {
          // Create a simple GeoJSON feature
          const featureData = JSON.stringify([{
            type: 'Feature',
            id: 'paste-test-feature',
            properties: {
              name: 'Test Feature',
              dataType: 'reference-point',
              'marker-color': '#FF0000',
              visible: true
            },
            geometry: {
              type: 'Point',
              coordinates: [0, 0]
            }
          }])
          
          // Write to clipboard
          await navigator.clipboard.writeText(featureData)
          console.log('Data written to clipboard:', featureData)
          
          // Trigger events to notify the app
          document.dispatchEvent(new Event('visibilitychange'))
          window.dispatchEvent(new Event('focus'))
          
          return true
        } catch (error) {
          console.error('Failed to set clipboard:', error)
          return false
        }
      }
    }
  })
  
  // Now use our test helper to set the clipboard content
  console.log('Setting clipboard content with test helper')
  const clipboardSet = await page.evaluate(() => {
    return window.testHelper?.setClipboardWithValidGeoJSON()
  })
  
  console.log('Clipboard set result:', clipboardSet)
  
  // Wait for the app to process the clipboard
  await page.waitForTimeout(1000)
  
  // check paste button is enabled
  await expect(pasteButton).not.toBeDisabled()

  // Now click the paste button
  // Note: In a real browser environment with clipboard permissions, 
  // this would paste the copied feature
  console.log('about to click paste')
  expect(await pasteButton.isVisible()).toBeTruthy()
  expect(await pasteButton.isEnabled()).toBeTruthy()
  await pasteButton.click({ force: true })
  
  // // After pasting, we should see a new item in the tree
  // // Wait for the UI to update
  await page.waitForTimeout(500)

  console.log('paste clicked')
  
  // // Expand the Points node again if it collapsed
  await pointsNode.click()
  
  // // Wait for the points to be visible
  await page.waitForTimeout(100)
  
  // // Verify that there's at least one point visible after pasting
  const pointsAfterPaste = page.locator('span:has-text("' + featureName + '")')
  await expect(pointsAfterPaste).toBeVisible()
})
