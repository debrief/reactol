import { test, expect } from '@playwright/test'

test('Copying features in Layers component', async ({ page }) => {
  const plotName = 'Copy Features Test'
  
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
  
  // Find the copy button
  const copyButton = page.locator('.layers-copy-button')
  
  // Initially, the copy button should be disabled
  await expect(copyButton).toBeDisabled()
  
  // Expand the "Points" node to find reference points (which should be copyable)
  const pointsNode = page.locator('.ant-tree-title:has-text("Points")').first()
  await pointsNode.click()
  
  // Wait for the points to be visible
  await page.waitForTimeout(100)
  
  // Select a track
  const referencePoint = page.locator('.ant-tree-node-content-wrapper')
    .filter({ has: page.locator('.ant-tree-title') })
    .nth(11)
  console.log('got button', referencePoint)  
  await referencePoint.click()
  
  // Verify that the copy button is now enabled (reference points should be copyable)
  await expect(copyButton).not.toBeDisabled()
  
  // Click the copy button
  await copyButton.click()
  
  // There's no direct way to verify clipboard content in Playwright, but we can
  // verify that the UI responds as expected after a copy operation
  
  // Clear the selection
  const clearSelectionButton = page.locator('button', { has: page.locator('.anticon-close-circle') })
  await clearSelectionButton.click()
  
  // Verify that the copy button is disabled again
  await expect(copyButton).toBeDisabled()
  
  // Test copying multiple items
  // Select multiple reference points
  await referencePoint.click()
  
  // Hold down Ctrl/Cmd key and click another item
  await page.keyboard.down('Control')
  const secondPoint = page.locator('.ant-tree-node-content-wrapper')
    .filter({ has: page.locator('.ant-tree-title') })
    .nth(11)
  await secondPoint.click()
  await page.keyboard.up('Control')
  
  // Verify that the copy button is enabled
  await expect(copyButton).not.toBeDisabled()
  
  // Click the copy button to copy multiple items
  await copyButton.click()
  
  // Test keyboard shortcut for copying
  // Clear selection first
  await clearSelectionButton.click()
  
  // Select an item again
  await referencePoint.click()
  
  // Press Ctrl+C
  await page.keyboard.press('Control+c')
  
  // Verify that the UI still shows the item as selected
  await expect(referencePoint).toHaveClass(/ant-tree-node-selected/)
})
