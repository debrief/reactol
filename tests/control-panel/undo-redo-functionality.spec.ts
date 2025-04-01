import { test, expect } from '@playwright/test'

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

  // create undo queue by deleting `VAN GALEN` from Layers component.
  // find a span with the text `VAN GALEN`
  const vanGalen = page.locator('span:has-text("VAN GALEN")').first()
  await expect(vanGalen).toBeVisible()
  await vanGalen.click()

  // Wait for the UI to update
  await page.waitForTimeout(100)

  // check delete is enabled
  await expect(deleteButton).not.toBeDisabled()

  // Click the delete button
  await deleteButton.click()

  // Wait for the UI to update
  await page.waitForTimeout(200)

  // check we can no longer find `VAN GALEN`
  await expect(vanGalen).not.toBeVisible()

  // check the undo/redo button is enabled
  await expect(undoRedoButton).not.toBeDisabled()

  // Click the undo/redo button to open the modal
  await undoRedoButton.click()
  
  // Verify the undo modal appears
  const undoModal = page.locator('.ant-modal-content').filter({ hasText: 'Select a version' })
  await expect(undoModal).toBeVisible()
  
  // Close the modal
  await undoModal.locator('button:has-text("Cancel")').click()

  // Wait for the UI to update
  await page.waitForTimeout(100)

  // check undo modal closed
  await expect(undoModal).not.toBeVisible()

  // check vanGalen still not visible
  await expect(vanGalen).not.toBeVisible()
  
  // re-open the undo modal
  await undoRedoButton.click()
  await expect(undoModal).toBeVisible()

  // Select the first version
  await undoModal.locator('.ant-list-items').locator('.ant-list-item').first().click()

  // do restore
  await page.locator('button:has-text("Restore Version")').click()

  // check undo modal closed
  await expect(undoModal).not.toBeVisible()

  // Wait for the UI to update
  await page.waitForTimeout(100)

  // check vanGalen is visible
  await expect(vanGalen).toBeVisible()

  // Wait for the UI to update
  await page.waitForTimeout(100)
})
