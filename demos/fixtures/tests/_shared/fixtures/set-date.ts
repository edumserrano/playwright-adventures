import { BrowserContext } from '@playwright/test';

export async function setDate(context: BrowserContext): Promise<void> {
  // We need to control the year for Date object because we display the current year on the footer.
  // The implemented solution is based on https://github.com/microsoft/playwright/issues/6347#issuecomment-1085850728.
  // We went with the simpler solution because the only thing we need to control is the year but if needed,
  // that GitHub issue shows other ways to control the flow of time. See https://github.com/microsoft/playwright/issues/6347#issuecomment-965887758
  // and other alternatives proposed in that issue.
  //
  // An alternative implementation could be similar to what was done to control institution test data where we created different providers on angular
  // and used a provider factory to choose which implementation to use. If in app mode use the app implementation and if in test mode use the test implementation.
  // We could do the same to control the date with a bit of refactoring on the app code. See:
  // - tests\_tests-shared\fixtures\load-institution-data.ts
  // - src\app\core\domain\institutions-data.service.ts
  // const fakeYear = 2023;
  // const fakeNow = new Date(`January 20 ${fakeYear} 09:00:00`).valueOf();
  // await context.addInitScript(`{
  //       // Extend Date constructor to default to fakeNow
  //       Date = class extends Date {
  //         constructor(...args) {
  //           if (args.length === 0) {
  //             super(${fakeNow});
  //           } else {
  //             super(...args);
  //           }
  //         }
  //       }
  //       // Override Date.now() to start from fakeNow
  //       const __DateNowOffset = ${fakeNow} - Date.now();
  //       const __DateNow = Date.now;
  //       Date.now = () => __DateNow() + __DateNowOffset;
  //     }`);

  // "January 20 2023 09:00:00"
  // await context.addInitScript({path: "./tests/_shared/fixtures/date.js"}, "January 20 2023 09:00:00");
  // await context.addInitScript({path: "./tests/_shared/fixtures/date.js"});
}
