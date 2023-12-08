import { test as baseTest } from '@playwright/test';
import { istanbulCodeCoverageInstrumentationDir } from 'playwright.shared-vars';
import { collectIstanbulCodeCoverageAsync } from 'tests/_shared/fixtures/istanbul-code-coverage';

// re-exporting the default expect as well so that on the tests we can have
// a single import for expect and test, but the test will be the extended test below
export { expect } from '@playwright/test';

// See https://playwright.dev/docs/test-fixtures and https://playwright.dev/docs/test-parameterize
export const test = baseTest.extend({
  context: async ({ context }, use) => {
    await collectIstanbulCodeCoverageAsync(
      context,
      use,
      istanbulCodeCoverageInstrumentationDir
    );
  },
});
