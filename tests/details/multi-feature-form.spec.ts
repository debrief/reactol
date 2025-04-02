import { test, expect } from '@playwright/test'

test('MultiFeatureForm displays when multiple features are selected and visibility toggle works', async ({ page }) => {
  const plotName = 'Multi Feature Form Test'
  
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
  await page.waitForTimeout(100)

  // get the `Units` node
  const unitsNode = page.locator('.ant-tree-title:has-text("Units")').first()
  await unitsNode.click()
  
  // Expand the "Points" node to find reference points
  const pointsNode = page.locator('.ant-tree-title:has-text("Points")').first()
  await pointsNode.click()
  
  // Wait for the points to be visible
  await page.waitForTimeout(100)
  
  // Get the count of available points
  const pointNode = page.locator('span:has-text("Points")').first()  
  await pointNode.click()

  // Ensure we have at least 2 points to select
  const pointNodes = pointNode.locator('span')
  const count = await pointNodes.count()
  expect(count).toBeGreaterThan(1)
  
  // Select the first point
  const firstPoint = page.locator('span:has-text("SONO 1-1")').first()  
  const secondPoint = page.locator('span:has-text("SONO 1-2")').first()  
  await firstPoint.click()

  // we've got one item selected.  Wait for the detail panel to open
  await page.waitForSelector('#createShape')

  // check the feature is visible
  const trackVisControl = page.locator('#createShape_visible')
  await expect(trackVisControl).toBeChecked()

  // hold down control
  await page.keyboard.down('Meta')
  await secondPoint.click()
  await page.keyboard.up('Meta')
  
  // Verify that the MultiFeatureForm is displayed
  await expect(page.locator('strong:has-text("2 items")')).toBeVisible()
  
  // Verify that the visibility checkbox is present
  const visibilityCheckbox = page.locator('.multi-feature-visibility')
  
  await expect(visibilityCheckbox).toBeVisible()
  
  // Check if the checkbox is checked (all items visible)
  const isChecked = await visibilityCheckbox.isChecked()
  
  // Toggle visibility by clicking the checkbox
  await visibilityCheckbox.click()
  
  // Verify that the checkbox state has changed
  if (isChecked) {
    // If it was checked, it should now be unchecked
    await expect(visibilityCheckbox).not.toBeChecked()
  } else {
    // If it was unchecked, it should now be checked
    await expect(visibilityCheckbox).toBeChecked()
  }
  
  // Wait for the visibility change to take effect
  await page.waitForTimeout(100)
  
  // Verify that the color picker is present
  await expect(page.locator('.multi-feature-color')).toBeVisible()
  
  // Verify that the delete button is present
  await expect(page.locator('.multi-feature-delete')).toBeVisible()

  // re-select the first point
  await firstPoint.click()

  // Verify that the MultiFeatureForm is no longer displayed
  await expect(page.locator('strong:has-text("2 items")')).not.toBeVisible()

  // re-select the first point
  await firstPoint.click()

  // wait for the detail panel to open
  await page.waitForSelector('#createShape')

  // verify the value of the visibility is false
  const trackVisControl2 = page.locator('#createShape_visible')
  await expect(trackVisControl2).not.toBeChecked()
  
})
