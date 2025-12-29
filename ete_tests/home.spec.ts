import { test, expect } from '@playwright/test';
import { dismissMobileHint } from './test-helpers';

test.describe('Home Page - Political Characters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissMobileHint(page);
  });

  test('should display the main title and subtitle', async ({ page }) => {
    await expect(page.locator('h1:text("Tout va bien !")')).toBeVisible();
    await expect(page.locator('text=Le jeu de puzzle politique')).toBeVisible();
  });

  test('should display the game description', async ({ page }) => {
    await expect(
      page.locator(
        'text=Place les personnages aux bons endroits pour résoudre les puzzles politiques'
      )
    ).toBeVisible();
  });

  test('should display all political characters', async ({ page }) => {
    // Check that all political character cards are present
    await expect(page.locator('[data-testid="display-card-lepen"]')).toBeVisible();
    await expect(page.locator('[data-testid="display-card-macron"]')).toBeVisible();
    await expect(page.locator('[data-testid="display-card-melenchon"]')).toBeVisible();
    await expect(page.locator('[data-testid="display-card-sarko"]')).toBeVisible();
  });

  test('should have functional play button', async ({ page }) => {
    const playButton = page.locator('text=▶ Jouer');
    await expect(playButton).toBeVisible();

    await playButton.click();

    // Should navigate to first level
    await expect(page).toHaveURL(/level=1/);
    await page.waitForLoadState('networkidle');

    // Should not see home screen content anymore
    await expect(page.locator('text=▶ Jouer')).not.toBeVisible();
  });

  test('should have functional create level button', async ({ page }) => {
    const createButton = page.locator('text=✏️ Crée ton niveau');
    await expect(createButton).toBeVisible();

    await createButton.click();

    // Should navigate to create mode
    await expect(page).toHaveURL(/level=create/);
    await page.waitForLoadState('networkidle');

    // Should not see home screen content anymore
    await expect(page.locator('text=✏️ Crée ton niveau')).not.toBeVisible();
  });
});
