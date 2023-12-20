import { test as baseTest } from '@playwright/test';
import { setDate } from 'tests/_shared/fixtures/set-date';

// re-exporting the default expect as well so that on the tests we can have
// a single import for expect and test, but the test will be the extended test below
export { expect } from '@playwright/test';

// See https://playwright.dev/docs/test-fixtures and https://playwright.dev/docs/test-parameterize
interface AppFixtures {
  // playwrightProjectInfo: PlaywrightProjectInfo;
  // consoleMessages: ReadonlyArray<ConsoleMessageData>;
  // annotationsAutoFixture: void;
  // codeCoverageAutoTestFixture: void;
  // consoleAutoFixture: void;
  // defaultRouteFulfills: void;
}

// export the extended test type.
// all tests that use this test type will have the automatic fixture
// applied to them.
export const test = baseTest.extend<AppFixtures>({
  context: async ({ context }, use) => {
    // await setDate(context);
    console.log("context");
    await context.addInitScript({path: "./tests/_shared/fixtures/date.js"});
    await use(context);
  },
});
