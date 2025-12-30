import { test, expect } from '@playwright/test'

test.describe('Stories', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stories')
  })

  test('should display stories list', async ({ page }) => {
    // Wait for sidebar to load
    await page.waitForSelector('text=Mêşka Sor', { timeout: 5000 })
    await expect(page.getByText(/mêşka sor/i)).toBeVisible()
  })

  test('should open a story', async ({ page }) => {
    // Click on first story
    await page.click('text=Mêşka Sor')
    
    // Story content should be visible
    await expect(page.getByText(/mêşk/i)).toBeVisible({ timeout: 5000 })
  })

  test('should play audio for paragraph', async ({ page }) => {
    await page.click('text=Mêşka Sor')
    
    // Wait for story content
    await page.waitForSelector('button[title*="Play"]', { timeout: 5000 })
    
    // Click play button
    const playButton = page.locator('button[title*="Play"]').first()
    await playButton.click()
    
    // Button should show playing state
    await expect(playButton).toBeDisabled({ timeout: 2000 })
  })

  test('should show word translation on click', async ({ page }) => {
    await page.click('text=Mêşka Sor')
    
    // Wait for story content
    await page.waitForSelector('text=mêşk', { timeout: 5000 })
    
    // Click on a word (assuming it's clickable)
    const word = page.getByText(/mêşk/i).first()
    await word.click()
    
    // Translation tooltip should appear
    await expect(page.getByText(/ant/i)).toBeVisible({ timeout: 2000 })
  })

  test('should toggle English translations', async ({ page }) => {
    await page.click('text=Mêşka Sor')
    
    // Find toggle button
    const toggleButton = page.getByRole('button', { name: /english|translation/i })
    await toggleButton.click()
    
    // English text should be visible
    await expect(page.getByText(/ant|red|garden/i)).toBeVisible({ timeout: 3000 })
  })
})












