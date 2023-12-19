import { test, expect } from 'tests/_shared/app-fixtures';

test('test-one', async ({ page }) => {
  // this relative navigation is possible because of the baseURL
  // property that is configured int the playwright.config.ts
  await page.goto('/');
  await expect(page).toHaveScreenshot();
});

test('test-two', async ({ page }) => {
  // this relative navigation is possible because of the baseURL
  // property that is configured int the playwright.config.ts
  await page.goto('/');
  await expect(page).toHaveScreenshot();
});
