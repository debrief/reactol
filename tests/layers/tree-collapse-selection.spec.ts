import { test, expect } from '@playwright/test'

test('Collapsing the tree and clearing selection in Layers component', async ({ page }) => {
  const plotName = 'Tree Collapse and Selection Test'
  
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

  // quick delay, to let layers load
  await page.waitForTimeout(100)
  
  // Verify that the tree is expanded by default (check for expanded nodes)
  await expect(page.locator('.ant-tree-node-content-wrapper-open').first()).toBeVisible()
  
  // Select a feature from the tree (VAN GALEN is a known feature in the sample plot)
  const vanGalenNode = page.locator('span:has-text("VAN GALEN")').first()
  await expect(vanGalenNode).toBeVisible()
  await vanGalenNode.click()
  
  // Verify that the item is selected
  await expect(vanGalenNode).toHaveClass(/ant-tree-node-selected/)
  
  // Verify that the clear selection button is enabled
  const clearSelectionButton = page.locator('.layers-clear-button')
  await expect(clearSelectionButton).not.toBeDisabled()
  
  // Click the collapse all button
  const collapseButton = page.locator('.layers-collapse-button')
  await expect(collapseButton).not.toBeDisabled()
  await collapseButton.click()
  
  // Verify that the tree is collapsed
  await expect(page.locator('.ant-tree-treenode-switcher-close').first()).toBeVisible()
  
  // Verify that the selection is maintained even after collapsing
  await expect(clearSelectionButton).not.toBeDisabled()
  
  // Click the clear selection button
  await clearSelectionButton.click()
  
  // Verify that the selection is cleared
  await expect(clearSelectionButton).toBeDisabled()
  
  // Expand the tree again to verify we can still access nodes
  const unitsNode = page.locator('.ant-tree-title:has-text("Units")').first()
  await unitsNode.click()

  // quick delay, to let layers load
  await page.waitForTimeout(100)
  
  // Verify that nodes are expanded
  await expect(page.locator('.ant-tree-node-content-wrapper-open').first()).toBeVisible()
})
