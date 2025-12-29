import { test, expect } from '@playwright/test';
import { dismissMobileHint } from './test-helpers';

test.describe('Level Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissMobileHint(page);
    // Navigate to create mode
    await page.locator('text=✏️ Crée ton niveau').click();
    await page.waitForLoadState('networkidle');
  });

  test('should display create mode with special styling', async ({ page }) => {
    // Check URL
    await expect(page).toHaveURL(/level=create/);

    // Check for create mode specific background
    const gameContainer = page.locator('.game-container');
    await expect(gameContainer).toHaveClass(/from-red-900/);
    await expect(gameContainer).toHaveClass(/to-pink-900/);
  });

  test('should show create level in sidebar with special styling', async ({ page }) => {
    // Create level should have + badge
    const plusBadge = page.locator('text=+');
    await expect(plusBadge).toBeVisible();

    // Check that create level button exists in sidebar
    await expect(page.locator('text=Créez votre niveau')).toBeVisible();
  });

  test('should navigate to create mode from sidebar', async ({ page }) => {
    // Go to regular level first
    await page.goto('/?level=1');
    await page.waitForLoadState('networkidle');

    // Click create level from sidebar
    await page.locator('text=Créez votre niveau').first().click();
    await expect(page).toHaveURL(/level=create/);

    // Should have create mode styling
    const gameContainer = page.locator('.game-container');
    await expect(gameContainer).toHaveClass(/from-red-900/);
  });

  test('should be able to navigate back to regular levels from create mode', async ({ page }) => {
    // Click on level 1 badge from sidebar
    await page.locator('span:text("1")').first().click();
    await expect(page).toHaveURL(/level=1/);

    // Should not have create mode styling
    const gameContainer = page.locator('.game-container');
    await expect(gameContainer).not.toHaveClass(/from-red-900/);
    await expect(gameContainer).toHaveClass(/to-gray-900/);
  });

  test('should maintain create mode state during navigation', async ({ page }) => {
    // Verify we're in create mode
    await expect(page).toHaveURL(/level=create/);

    // Navigate to home and back
    await page.locator('button[title*="Retour"]').click();
    await page.locator('text=✏️ Crée ton niveau').click();

    // Should still be in create mode
    await expect(page).toHaveURL(/level=create/);
    const gameContainer = page.locator('.game-container');
    await expect(gameContainer).toHaveClass(/from-red-900/);
  });
});
