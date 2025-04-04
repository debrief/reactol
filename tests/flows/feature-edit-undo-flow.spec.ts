import { test, expect } from '@playwright/test'

test('Feature editing should update properties panel and undo system', async ({ page }) => {
  const plotName = 'Feature Edit Flow Test'
  
  // Setup: Create a sample plot
  await page.goto('/')
  await page.waitForSelector('button:has-text("Sample plot")')
  await page.click('button:has-text("Sample plot")')
  await page.waitForSelector('div.ant-modal-content')
  await page.locator('input.ant-input').fill(plotName)
  await page.locator('button:has-text("OK")').click()
  await page.waitForSelector('.flexlayout__tab_button_content')
  
  // Step 1: Select a feature in the layer panel
  const featureName = 'VAN GALEN'
  const featureInTree = page.locator(`span:has-text("${featureName}")`).first()
  await expect(featureInTree).toBeVisible()
  await featureInTree.click()
  
  // Step 2: Verify the Properties panel updates to show the selected feature
  const propertiesPanel = page.locator('.core-form-animated')
  await expect(propertiesPanel).toBeVisible()
  
  // Verify the name field in properties panel shows the selected feature name
  const nameField = propertiesPanel.locator('input[id="trackPropertiesForm_name"]')
  await expect(nameField).toHaveValue(featureName)

  // Check Save button is currently disabled
  await expect(propertiesPanel.locator('button:has-text("Save")')).toBeDisabled()
  
  // Check Reset button is currently disabled
  await expect(propertiesPanel.locator('button:has-text("Reset")')).toBeDisabled()
  
  // Step 3: Edit the feature's name in the property panel
  const newName = 'RENAMED FEATURE'
  await nameField.clear()
  await nameField.fill(newName)
  await page.keyboard.press('Enter')
  
  // Wait for the UI to update
  await page.waitForTimeout(200)

  // Check Save and Reset buttons are enabled
  await expect(propertiesPanel.locator('button:has-text("Save")')).not.toBeDisabled()
  await expect(propertiesPanel.locator('button:has-text("Reset")')).not.toBeDisabled()
  
  // Press Save on the form
  await propertiesPanel.locator('button:has-text("Save")').click()
  
  // Wait for the UI to update
  await page.waitForTimeout(200)

  // Check Save and Reset buttons are disabled
  await expect(propertiesPanel.locator('button:has-text("Save")')).toBeDisabled()
  await expect(propertiesPanel.locator('button:has-text("Reset")')).toBeDisabled()

  // Step 4: Verify the feature name is updated in the layer panel
  const updatedFeature = page.locator(`span:has-text("${newName}")`).first()
  await expect(updatedFeature).toBeVisible()
  
  // Step 5: Verify the undo button is enabled after the edit
  const undoRedoButton = page.locator('.undo-redo-button')
  await expect(undoRedoButton).not.toBeDisabled()
  
  // Step 6: Open the undo modal
  await undoRedoButton.click()
  
  // Step 7: Verify the undo modal appears with the correct description
  const undoModal = page.locator('.ant-modal-content').filter({ hasText: 'Select a version' })
  await expect(undoModal).toBeVisible()
  
  // Check that the undo description mentions the name attribute
  const undoDescription = undoModal.locator('.undo-item').first()
  await expect(undoDescription).toContainText('name')
  
  // Step 8: Perform the undo and verify the feature name reverts
  await undoModal.locator('.ant-list-items').locator('.ant-list-item').first().click()
  await page.locator('button:has-text("Restore Version")').click()
  
  // Wait for the UI to update
  await page.waitForTimeout(200)
  
  // Step 9: Verify original name is restored in both the layer panel and properties panel
  await expect(featureInTree).toBeVisible()
  await expect(updatedFeature).not.toBeVisible()
  
  // Verify the name field in properties panel shows the original name
  await expect(nameField).toHaveValue(featureName)
  
  // Step 10: Open the undo modal again to perform a Redo operation
  await undoRedoButton.click()
  await expect(undoModal).toBeVisible()
  
  // Step 11: Select the second item in the list (which would be the Redo operation)
  const redoItem = undoModal.locator('.ant-list-items').locator('.ant-list-item').first()
  await redoItem.click()
  
  // Step 12: Perform the Redo by clicking Restore Version
  await page.locator('button:has-text("Restore Version")').click()
  
  // Wait for the UI to update
  await page.waitForTimeout(200)
  
  // Step 13: Verify the feature name is changed back to the new name
  await expect(updatedFeature).toBeVisible()
  await expect(featureInTree).not.toBeVisible()
  
  // Verify the name field in properties panel shows the new name again
  await expect(nameField).toHaveValue(newName)
})
