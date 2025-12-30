import { test, expect } from '@playwright/test'

test.describe('Lessons', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to learn page
    await page.goto('/learn')
  })

  test('should display lessons list', async ({ page }) => {
    await expect(page.getByText(/basic grammar/i)).toBeVisible()
    await expect(page.getByText(/colors/i)).toBeVisible()
  })

  test('should navigate to grammar lesson', async ({ page }) => {
    await page.click('text=Basic Grammar')
    await expect(page).toHaveURL(/.*\/learn\/.*\/grammar/)
  })

  test('should display lesson content', async ({ page }) => {
    await page.click('text=Basic Grammar')
    
    // Wait for lesson content to load
    await expect(page.getByText(/sentence structure/i)).toBeVisible({ timeout: 5000 })
  })

  test('should play audio when audio button is clicked', async ({ page }) => {
    await page.goto('/learn/kurmanji/grammar')
    
    // Wait for page to load
    await page.waitForSelector('button[title*="Play"]', { timeout: 5000 })
    
    // Click first audio button
    const audioButton = page.locator('button[title*="Play"]').first()
    await audioButton.click()
    
    // Audio should start playing (check for loading/playing state)
    await expect(audioButton).toBeDisabled({ timeout: 2000 })
  })

  test('should track progress when section is expanded', async ({ page }) => {
    await page.goto('/learn/kurmanji/grammar')
    
    // Expand a section
    const section = page.getByText(/basic sentence structure/i).first()
    await section.click()
    
    // Wait for content to appear
    await expect(page.getByText(/subject-object-verb/i)).toBeVisible({ timeout: 3000 })
  })
})












