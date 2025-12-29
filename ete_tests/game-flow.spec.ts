import { test, expect } from '@playwright/test';
import { goToHomePage } from './test-helpers';

test.describe('Game Flow and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await goToHomePage(page);
  });

  test('should complete full user journey from home to game', async ({ page }) => {
    // Start on home page
    await expect(page.locator('h1:text("Tout va bien !")')).toBeVisible();
    await expect(page.locator('text=▶ Jouer')).toBeVisible();

    // Navigate to first level
    await page.locator('text=▶ Jouer').click();
    await page.waitForLoadState('networkidle');

    // Should be on level 1
    await expect(page).toHaveURL(/level=1/);

    // Should see game interface (sidebar visible)
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // Should not see home screen elements
    await expect(page.locator('h1:text("Tout va bien !")')).not.toBeVisible();
  });

  test('should navigate between multiple levels', async ({ page }) => {
    // Start a game
    await page.locator('text=▶ Jouer').click();
    await page.waitForLoadState('networkidle');

    // Navigate to level 2 if it exists
    const level2Button = page.locator('text=Level 2').first();
    if (await level2Button.isVisible()) {
      await level2Button.click();
      await expect(page).toHaveURL(/level=2/);

      // Navigate back to level 1
      await page.locator('text=Level 1').first().click();
      await expect(page).toHaveURL(/level=1/);
    }
  });

  test('should handle URL direct navigation', async ({ page }) => {
    // Navigate directly to level 1
    await page.goto('/?level=1');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('span:text("1")').first()).toBeVisible(); // Level badge shows "1"

    // Navigate directly to create mode
    await page.goto('/?level=create');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('span:text("+")').first()).toBeVisible(); // Create level badge shows "+"
  });

  test('should maintain state during browser navigation', async ({ page }) => {
    // Navigate to level 1
    await page.locator('text=▶ Jouer').click();
    await page.waitForLoadState('networkidle');

    // Manually navigate to home with browser API
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1:text("Tout va bien !")')).toBeVisible();

    // Navigate back to level 1 using direct URL
    await page.goto('/?level=1');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/level=1/);
    await expect(page.locator('aside')).toBeVisible();
  });

  test('should handle invalid level URLs gracefully', async ({ page }) => {
    // Try to navigate to a non-existent level
    await page.goto('/?level=999');
    await page.waitForLoadState('networkidle');

    // Should show home screen or handle gracefully
    // This depends on your app's error handling
    await expect(page.locator('h1:text("Tout va bien !")')).toBeVisible();
  });

  test('should return home from any level', async ({ page }) => {
    // Start from level 1
    await page.goto('/?level=1');
    await page.waitForLoadState('networkidle');

    // Click home button
    await page.locator('text=Tout va bien !').click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=▶ Jouer')).toBeVisible();

    // Test from create mode
    await page.goto('/?level=create');
    await page.waitForLoadState('networkidle');

    await page.locator('text=Tout va bien !').click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=▶ Jouer')).toBeVisible();
  });
});
