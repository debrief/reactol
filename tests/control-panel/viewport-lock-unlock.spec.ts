import { test, expect } from '@playwright/test'

test('Test viewport lock/unlock functionality in control panel', async ({ page }) => {
  const plotName = 'Viewport Lock Test'
  // Navigate to the application and create a sample plot
  await page.goto('/')
  await page.waitForSelector('button:has-text("Sample plot")')
  await page.click('button:has-text("Sample plot")')
  await page.waitForSelector('div.ant-modal-content')
  await page.locator('input.ant-input').fill(plotName)
  await page.locator('button:has-text("OK")').click()
  await page.waitForSelector('.flexlayout__tab_button_content')
  
  // Find the viewport lock button
  // Based on the component code, it's a button with UnlockOutlined/LockFilled icon
  const viewportLockButton = page.locator('button', { has: page.locator('.anticon-unlock, .anticon-lock') })
  
  // Check initial state - viewport should be unlocked by default
  // The button should have 'outlined' variant when unlocked
  await expect(viewportLockButton).toHaveAttribute('class', expect.stringMatching(/.*ant-btn-outlined.*/))
  
  // Find the copy to clipboard button
  const copyButton = page.locator('.copy-map-to-clipboard')
  
  // Copy button should be disabled when viewport is unlocked
  await expect(copyButton).toBeDisabled()
  
  // Click the viewport lock button to lock the viewport
  await viewportLockButton.click()
  
  // Verify the button state changed - it should now have 'solid' variant
  await expect(viewportLockButton).toHaveAttribute('class', expect.stringMatching(/.*ant-btn-solid.*/))
  
  // Copy button should now be enabled
  await expect(copyButton).not.toBeDisabled()
  
  // Click the viewport lock button again to unlock
  await viewportLockButton.click()
  
  // Verify the button state changed back
  await expect(viewportLockButton).toHaveAttribute('class', expect.stringMatching(/.*ant-btn-outlined.*/))
  
  // Copy button should be disabled again
  await expect(copyButton).toBeDisabled()
})
