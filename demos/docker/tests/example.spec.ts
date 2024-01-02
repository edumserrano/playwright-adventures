import { expect, test } from "@playwright/test";

test("load page", async ({ page }) => {
  // this relative navigation is possible because of the baseURL
  // property that is configured int the playwright.config.ts
  await page.goto("/");
  await expect(page).toHaveScreenshot();
});
