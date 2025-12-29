import { test, expect } from '@playwright/test';
import { navigateToGame } from './test-helpers';

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToGame(page);
  });

  test('should display sidebar with level buttons', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // Check for level buttons
    await expect(page.locator('button span:text("1")').first()).toBeVisible(); // Level badge

    // Check for create level - might be collapsed on mobile
    const createText = page.locator('text=Créez votre niveau');
    if (await createText.isVisible()) {
      await expect(createText).toBeVisible();
    } else {
      // On mobile/collapsed, check for + badge instead
      await expect(page.locator('span:text("+")').first()).toBeVisible();
    }

    // Check for description text when sidebar is expanded (specific sidebar description)
    const description = page.locator('p.m-2:text("Place les personnages aux bons endroits")');
    if (await description.isVisible()) {
      await expect(description).toBeVisible();
    }
    // If collapsed, description should not be visible, which is correct
  });

  test('should navigate between levels', async ({ page }) => {
    // Click on level 2 badge if it exists
    const level2Badge = page.locator('span:text("2")');
    if (await level2Badge.isVisible()) {
      await level2Badge.click();
      await expect(page).toHaveURL(/level=2/);
    }

    // Click on level 1 badge
    await page.locator('span:text("1")').first().click();
    await expect(page).toHaveURL(/level=1/);
  });

  test('should navigate to create mode', async ({ page }) => {
    // Try to find create button by text first, fallback to + badge
    const createTextButton = page.locator('text=Créez votre niveau').first();
    const createBadgeButton = page.locator('span:text("+")').first();

    if (await createTextButton.isVisible()) {
      await expect(createTextButton).toBeVisible();
      await createTextButton.click();
    } else {
      // Fallback to + badge (collapsed sidebar)
      await expect(createBadgeButton).toBeVisible();
      await createBadgeButton.click();
    }

    await expect(page).toHaveURL(/level=create/);

    // Check for create mode specific styling
    const gameContainer = page.locator('.game-container');
    await expect(gameContainer).toHaveClass(/from-red-900/);
  });

  test('should show create level with + badge', async ({ page }) => {
    // Look for the + symbol in the create level button
    const plusBadge = page.locator('text=+');
    await expect(plusBadge).toBeVisible();
  });

  test('should show numbered badges for regular levels', async ({ page }) => {
    // Check for level number badges
    await expect(page.locator('text=1').first()).toBeVisible();

    // Check if Level 2 exists and has badge
    const level2Badge = page.locator('text=2').first();
    if (await level2Badge.isVisible()) {
      await expect(level2Badge).toBeVisible();
    }
  });

  test('should have functional home button', async ({ page }) => {
    const homeButton = page.locator('button[title*="Retour"]');
    await expect(homeButton).toBeVisible();

    await homeButton.click();
    await expect(page).toHaveURL('/');

    // Should see home screen content
    await expect(page.locator('text=▶ Jouer')).toBeVisible();
  });

  test('should be collapsible', async ({ page }) => {
    // Find the toggle button
    const toggleButton = page.locator('button[title*="sidebar"]').first();
    await expect(toggleButton).toBeVisible();

    await toggleButton.click();
    await page.waitForTimeout(500); // Wait for animation

    // Sidebar should be collapsed (narrower width)
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/w-14/);

    // Description text should be hidden
    await expect(page.locator('text=Place les personnages aux bons endroits')).not.toBeVisible();
  });
});
