import { test, expect } from '@playwright/test'

test('Deleting items in Layers component', async ({ page }) => {
  const plotName = 'Delete Items Test'
  
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
  
  // Initially, the delete button should be disabled
  const deleteButton = page.locator('.layers-delete-button').first()
  await expect(deleteButton).toBeDisabled()
  
  // Select a feature from the tree (VAN GALEN is a known feature in the sample plot)
  const vanGalenNode = page.locator('span:has-text("VAN GALEN")').first()
  await expect(vanGalenNode).toBeVisible()
  await vanGalenNode.click()
  
  // Verify that the delete button is now enabled
  await expect(deleteButton).not.toBeDisabled()
  
  // Click the delete button
  await deleteButton.click()
  
  // Verify that the item is deleted (no longer visible in the tree)
  await expect(vanGalenNode).not.toBeVisible()
  
  // Verify that the delete button is disabled again after deletion
  await expect(deleteButton).toBeDisabled()
  
  // Test deleting multiple items at once
  // First, select multiple items
  // Expand the "Points" node to find reference points
  const pointsNode = page.locator('.ant-tree-title:has-text("Points")').first()
  await pointsNode.click()
  
  // Wait for the points to be visible
  await page.waitForTimeout(100)
  
  // Select the first two reference points (if available)
  const firstPoint = page.locator('.ant-tree-title:has-text("SONO 1-1")').first()
  await firstPoint.click()
  
  // Hold down Ctrl/Cmd key and click another item
  await page.keyboard.down('Meta')
  const secondPoint = page.locator('.ant-tree-title:has-text("SONO 1-2")').first()
  await secondPoint.click()
  await page.keyboard.up('Meta')
  
  // Verify that the delete button is enabled
  await expect(deleteButton).not.toBeDisabled()
  
  // Click the delete button to delete multiple items
  await deleteButton.click()

  // wait for the ui to update
  await page.waitForTimeout(100)

  // Verify that the delete button is disabled again after deletion
  await expect(deleteButton).toBeDisabled()

  // check the two items are no longer present
  await expect(firstPoint).not.toBeVisible()
  await expect(secondPoint).not.toBeVisible()

  // now select the 10th item
  const thirdPoint = page.locator('.ant-tree-title:has-text("NEW SONO")').first()
  await thirdPoint.click()
  
  // Verify that the delete button is enabled
  await expect(deleteButton).not.toBeDisabled()
  
  // Press Delete key
  await page.keyboard.press('Delete')
  
  // Verify that the delete button is disabled again after deletion
  await expect(deleteButton).toBeDisabled()

  // check the item is no longer present
  await expect(thirdPoint).not.toBeVisible()
})
