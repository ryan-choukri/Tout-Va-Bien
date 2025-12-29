import { Page } from '@playwright/test';

export async function dismissMobileHint(page: Page) {
  // Close mobile rotation hint if it appears
  try {
    await page.locator('button[aria-label="Close"]').click({ timeout: 2000 });
  } catch {
    // Modal might not appear on desktop or if screen is already landscape
  }
}

export async function goToHomePage(page: Page) {
  await page.goto('/');
  await dismissMobileHint(page);
}

export async function navigateToGame(page: Page) {
  await goToHomePage(page);
  await page.locator('text=▶ Jouer').click();
  await page.waitForLoadState('networkidle');
}
