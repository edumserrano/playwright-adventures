import { Page } from '@playwright/test';

// Based on https://github.com/microsoft/playwright/issues/6347#issuecomment-1085850728.
//
// The issue https://github.com/microsoft/playwright/issues/6347 contains other solutions
// such as https://github.com/microsoft/playwright/issues/6347#issuecomment-965887758 which
// also allow you to control the flow of time. The 'sinon fake-timers' solution might be useful
// if you need to do a test where you need to perform an action and then wait X amount of
// time before doing something else. Using the 'sinon fake-timers' solution would let you
// do such a test without actually having to wait any time.
//
// For this fixture demo I chose the simplest solution that allowed you to control
// the current date only.
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
