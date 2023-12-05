import { test as baseTest } from '@playwright/test';
import { collectV8CodeCoverageAsync } from 'tests/_shared/fixtures/v8-code-coverage';

export { expect } from '@playwright/test';

// See https://playwright.dev/docs/test-fixtures and https://playwright.dev/docs/test-parameterize

interface AppFixtures {
  codeCoverageAutoTestFixture: void;
}

export const test = baseTest.extend<AppFixtures>({
  codeCoverageAutoTestFixture: [
    async ({ browser, page }, use): Promise<void> => {
      await collectV8CodeCoverageAsync(browser, page, use);
    },
    {
      auto: true,
    },
  ],
});
