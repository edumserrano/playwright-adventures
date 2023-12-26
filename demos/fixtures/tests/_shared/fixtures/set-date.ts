import { Page } from "@playwright/test";

// Based on https://github.com/microsoft/playwright/issues/6347#issuecomment-1085850728.
export async function setDate(page: Page): Promise<void> {
  // set the window.__fakeNow global variable which gets picked up
  // by the set-date-script.js
  await page.addInitScript(() => {
    (window as any).__fakeNow = new Date("January 20 2024 09:00:00").valueOf();
  });
  await page.addInitScript({
    path: "./tests/_shared/fixtures/set-date-script.js",
  });
}
