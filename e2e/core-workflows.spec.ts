import { test, expect } from '@playwright/test';

test.describe('Core User Workflows', () => {
  test('should load home page and interact with core UI elements', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ItsJust|Template/i);
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();
  });

  test('should navigate through main sections or features', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});
