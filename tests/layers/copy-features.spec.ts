import { test, expect } from '@playwright/test'

test('Copying features in Layers component', async ({ browser }) => {
  const plotName = 'Copy Features Test'

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
  
  // Find the copy button
  const copyButton = page.locator('.layers-copy-button').first()
  const pasteButton = page.locator('.layers-paste-button').first()
  const deleteButton = page.locator('.layers-delete-button').first()
  
  // Initially, the copy button should be disabled
  await expect(copyButton).toBeDisabled()
  
  // Expand the "Points" node to find reference points (which should be copyable)
  const pointsNode = page.locator('.ant-tree-title:has-text("Points")').first()
  await pointsNode.click()
  
  // Wait for the points to be visible
  await page.waitForTimeout(100)
  
  // Select a track
  const referencePoint = page.locator('span:has-text("SONO 1-1")').first()
  await referencePoint.click()
  
  // Verify that the copy button is now enabled (reference points should be copyable)
  await expect(copyButton).not.toBeDisabled()
  
  // Click the copy button
  await copyButton.click({ force: true })

  await page.waitForTimeout(100)
  await expect(pasteButton).not.toBeDisabled()
  
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
  await page.keyboard.down('Meta')
  const secondPoint = page.locator('span:has-text("SONO 1-2")').first()
  await secondPoint.click()
  await page.keyboard.up('Meta')
  
  // Verify that the copy button is enabled
  await expect(copyButton).not.toBeDisabled()
  
  // Click the copy button to copy multiple items
  await copyButton.click({ force: true })

  // delete the selected items
  await deleteButton.click()

  await page.waitForTimeout(100)

  // check the items are not visible
  await expect(referencePoint).not.toBeVisible()
  await expect(secondPoint).not.toBeVisible()

  // restore the items
  await pasteButton.click()
  await page.waitForTimeout(100)

  // check the items are visible
  await expect(referencePoint).toBeVisible()
  await expect(secondPoint).toBeVisible()
  
  // Test keyboard shortcut for copying
  // Clear selection first
  await clearSelectionButton.click({ force: true })
  
  // check copy disabled
  await expect(copyButton).toBeDisabled()

  // Select an item again
  await referencePoint.click()

  // check copy enabled
  await expect(copyButton).not.toBeDisabled()
    
  // check paste disabled
  await expect(pasteButton).toBeDisabled()

  // Press Ctrl+C
  await page.keyboard.press('Control+c')

  // check paste enabled
  await expect(pasteButton).not.toBeDisabled()
  
  // Verify that the UI still shows the item as selected
  await expect(referencePoint).toHaveClass(/ant-tree-node-selected/)
})
