import { Page } from '@playwright/test';

// Based on https://github.com/microsoft/playwright/issues/6347#issuecomment-1085850728.
export async function setDate(page: Page): Promise<void> {
  const fakeNow = new Date("January 20 2024 09:00:00").valueOf();
  await page.addInitScript(`{
    // Extend Date constructor to default to fakeNow
    Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          super(${fakeNow});
        } else {
          super(...args);
        }
      }
    }

    // Override Date.now() to start from fakeNow
    const __DateNowOffset = ${fakeNow} - Date.now();
    const __DateNow = Date.now;
    Date.now = () => __DateNow() + __DateNowOffset;
  }`);
}
