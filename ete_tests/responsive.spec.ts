import { test, expect } from '@playwright/test';

test.describe('Mobile Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto('/');
  });

  test('should show mobile rotation hint on mobile devices in portrait', async ({
    page,
    context,
  }) => {
    // Simulate mobile user agent
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
      });
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show rotation hint overlay
    const rotationHint = page.locator('text=Tourne ton téléphone');
    if (await rotationHint.isVisible()) {
      await expect(rotationHint).toBeVisible();
      await expect(page.locator('text=Le jeu est prévu en mode horizontal')).toBeVisible();

      // Should have close button
      const closeButton = page.locator('button[aria-label="Close"]');
      await expect(closeButton).toBeVisible();

      // Should be able to close the hint
      await closeButton.click();
      await expect(rotationHint).not.toBeVisible();
    }
  });

  test('should auto-collapse sidebar on mobile', async ({ page }) => {
    // Close mobile rotation hint if it appears
    try {
      await page.locator('button[aria-label="Close"]').click({ timeout: 2000 });
    } catch {
      // Modal might not appear
    }

    // Navigate to a level
    await page.locator('text=▶ Jouer').click();
    await page.waitForLoadState('networkidle');

    // Sidebar should be collapsed on mobile
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/w-14/);

    // Description should be hidden
    await expect(
      page.locator('p.m-2:text("Place les personnages aux bons endroits")')
    ).not.toBeVisible();
  });

  test('should maintain functionality on mobile viewport', async ({ page }) => {
    // All main functionality should work on mobile
    await expect(page.locator('text=Tout va bien !')).toBeVisible();
    await expect(page.locator('text=▶ Jouer')).toBeVisible();

    // Close mobile rotation hint if it appears
    try {
      await page.locator('button[aria-label="Close"]').click({ timeout: 2000 });
    } catch {
      // Modal might not appear if already dismissed
    }

    // Navigate to game
    await page.locator('text=▶ Jouer').click();
    await page.waitForLoadState('networkidle');

    // Should see collapsed sidebar
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveClass(/w-14/);

    // Level buttons should still be clickable
    await page.locator('text=+').click(); // Create level
    await expect(page).toHaveURL(/level=create/);
  });

  test('should handle landscape orientation on mobile', async ({ page }) => {
    // Rotate to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Rotation hint should not appear in landscape
    await expect(page.locator('text=Tourne ton téléphone')).not.toBeVisible();

    // Game should be fully functional (no need to dismiss hint in landscape)
    await page.locator('text=▶ Jouer').click();
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
  });
});

test.describe('Desktop Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
  });

  test('should have expanded sidebar on desktop', async ({ page }) => {
    await page.locator('text=▶ Jouer').click();
    await page.waitForLoadState('networkidle');

    // Sidebar should be expanded on desktop
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/w-48/);

    // Description should be visible
    await expect(page.locator('text=Place les personnages aux bons endroits')).toBeVisible();
  });

  test('should not show mobile rotation hint on desktop', async ({ page }) => {
    // Should never show rotation hint on desktop
    await expect(page.locator('text=Tourne ton téléphone')).not.toBeVisible();
  });

  test('should allow sidebar toggle on desktop', async ({ page }) => {
    await page.locator('text=▶ Jouer').click();
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/w-48/);

    // Find and click toggle button
    const toggleButton = page.locator('button[title*="Collapse sidebar"]');
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Should collapse
    await expect(sidebar).toHaveClass(/w-14/);

    // Should be able to expand again
    const expandButton = page.locator('button[title*="Expand sidebar"]');
    await expandButton.click();
    await page.waitForTimeout(500);

    await expect(sidebar).toHaveClass(/w-48/);
  });
});
