import { ConsoleMessage, test as baseTest } from '@playwright/test';
import { setDate } from './fixtures/set-date';
import { addAnnotationsAsync } from 'tests/_shared/fixtures/annotations';
import { assertUncaughtExceptionsAsync } from 'tests/_shared/fixtures/fail-on-unexpected-console-messages';
import { captureConsoleMessagesAsync } from 'tests/_shared/fixtures/console-messages';
import { PlaywrightProjectName } from 'playwright.config';
import { capturePageErrorsAsync } from 'tests/_shared/fixtures/page-errors';
import { assertConsoleMessagesAsync } from 'tests/_shared/fixtures/fail-on-page-errors';

// re-exporting the default expect as well so that on the tests we can have
// a single import for expect and test, but the test will be the extended test below
export { expect } from '@playwright/test';

// See https://playwright.dev/docs/test-fixtures and https://playwright.dev/docs/test-parameterize
interface AppFixtures {
  annotationsAutoFixture: void;
  consoleMessages: ReadonlyArray<ConsoleMessage>;
  failOnUnexpectedConsoleMessages: void;
  uncaughtExceptions: ReadonlyArray<Error>;
  failOnUncaughtExceptions: void;
  projectName: PlaywrightProjectName;
}

// Export the extended test type.
// All tests that use this export 'test' type will have the automatic fixture applied to them
// and will also have access to the non-automatic fixtures like 'consoleMessages'.
export const test = baseTest.extend<AppFixtures>({
  page: async ({ page }, use) => {
    await setDate(page);
    await use(page);
  },
  annotationsAutoFixture: [
    async ({ browser, page, headless }, use): Promise<void> => {
      await addAnnotationsAsync(browser, page, headless);
      await use();
    },
    {
      auto: true,
    },
  ],
  consoleMessages: async ({ page }, use) => {
    await captureConsoleMessagesAsync(page, use);
  },
  failOnUnexpectedConsoleMessages: [
    async ({ consoleMessages }, use): Promise<void> => {
      await assertConsoleMessagesAsync(consoleMessages, use);
    },
    {
      auto: true,
    },
  ],
  uncaughtExceptions: async ({ page }, use) => {
    await capturePageErrorsAsync(page, use);
  },
  failOnUncaughtExceptions: [
    async ({ uncaughtExceptions }, use): Promise<void> => {
      await assertUncaughtExceptionsAsync(uncaughtExceptions, use);
    },
    {
      auto: true,
    },
  ],
  projectName: async ({}, use) => {
    const projectName = test.info().project.name as PlaywrightProjectName;
    await use(projectName);
  },
});
