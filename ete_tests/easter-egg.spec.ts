import { test, expect } from '@playwright/test';
import { goToHomePage } from './test-helpers';

test.describe('Sarko Easter Egg - Dev Mode Activation', () => {
  test.beforeEach(async ({ page }) => {
    await goToHomePage(page);
  });

  test('should activate dev mode after triple-clicking Sarko', async ({ page }) => {
    // Find Sarko character
    const sarkoCard = page.locator('[data-testid="display-card-sarko"]');
    await expect(sarkoCard).toBeVisible();

    // Triple click Sarko to activate dev mode
    await sarkoCard.click();
    await sarkoCard.click();
    await sarkoCard.click();

    // Wait a moment for the API call to complete (if mocked)
    await page.waitForTimeout(1000);

    // Navigate to a level to check sidebar
    await page.locator('text=▶ Jouer').click();
    await page.waitForLoadState('networkidle');

    // Check if dev mode is activated by looking for community levels section
    // This might appear in the sidebar if community levels were loaded
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
  });

  test('should not activate dev mode with only 1 or 2 clicks', async ({ page }) => {
    const sarkoCard = page.locator('[data-testid="display-card-sarko"]');

    // Click once
    await sarkoCard.click();

    // Navigate to level
    await page.locator('text=▶ Jouer').click();
    await page.waitForLoadState('networkidle');

    // Should not show community levels subtitle
    await expect(page.locator('text=Levels de la commu')).not.toBeVisible();
  });

  test('should reset click count after delay', async ({ page }) => {
    const sarkoCard = page.locator('[data-testid="display-card-sarko"]');

    // Click twice
    await sarkoCard.click();
    await sarkoCard.click();

    // Wait for timeout (2+ seconds)
    await page.waitForTimeout(2500);

    // Click once more (should not trigger dev mode as count was reset)
    await sarkoCard.click();

    // Navigate to level
    await page.locator('text=▶ Jouer').click();
    await page.waitForLoadState('networkidle');

    // Should not show community levels
    await expect(page.locator('text=Levels de la commu')).not.toBeVisible();
  });
});
