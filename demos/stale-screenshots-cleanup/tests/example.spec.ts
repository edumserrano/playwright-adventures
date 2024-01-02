import { test, expect } from "@playwright/test";

test("test-one", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot();
});

test("test-two", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot();
});
