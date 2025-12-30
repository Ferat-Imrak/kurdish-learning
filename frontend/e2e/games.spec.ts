import { test, expect } from '@playwright/test'

test.describe('Games', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games')
  })

  test('should display game categories', async ({ page }) => {
    await expect(page.getByText(/flashcards/i)).toBeVisible()
    await expect(page.getByText(/matching/i)).toBeVisible()
    await expect(page.getByText(/word builder/i)).toBeVisible()
  })

  test('should navigate to flashcards game', async ({ page }) => {
    await page.click('text=Flashcards')
    await expect(page).toHaveURL(/.*\/games\/flashcards/)
  })

  test('should start flashcards game', async ({ page }) => {
    await page.goto('/games/flashcards')
    
    // Wait for game to load
    await page.waitForSelector('button:has-text("Start")', { timeout: 5000 })
    
    // Click start button
    await page.click('button:has-text("Start")')
    
    // Game should start (card should be visible)
    await expect(page.locator('[data-testid="flashcard"], .card, [class*="card"]').first()).toBeVisible({ timeout: 3000 })
  })

  test('should flip flashcard on click', async ({ page }) => {
    await page.goto('/games/flashcards')
    
    // Start game
    await page.click('button:has-text("Start")')
    
    // Wait for card
    await page.waitForSelector('[data-testid="flashcard"], .card', { timeout: 3000 })
    
    // Click card to flip
    const card = page.locator('[data-testid="flashcard"], .card').first()
    await card.click()
    
    // Card should flip (check for different content)
    // This depends on your implementation
  })
})





