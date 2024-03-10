import { expect, test } from "@playwright/test";

test("load page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot();
});

test("some other test", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot();
});
