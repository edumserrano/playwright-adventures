import { test as baseTest } from "@playwright/test";
import {
  collectV8CodeCoverageAsync,
  CollectV8CodeCoverageOptions,
} from "tests/_shared/fixtures/v8-code-coverage";

// re-exporting the default expect as well so that on the tests we can have
// a single import for expect and test, but the test will be the extended test below
export { expect } from "@playwright/test";

// See https://playwright.dev/docs/test-fixtures and https://playwright.dev/docs/test-parameterize
interface AppFixtures {
  codeCoverageAutoTestFixture: void;
}

// Export the extended test type.
// All tests that use this export 'test' type will have the automatic fixture applied to them.
export const test = baseTest.extend<AppFixtures>({
  codeCoverageAutoTestFixture: [
    async ({ browser, page }, use): Promise<void> => {
      const options: CollectV8CodeCoverageOptions = {
        browserType: browser.browserType(),
        page: page,
        use: use,
        enableJsCoverage: true,
        enableCssCoverage: true,
      };
      await collectV8CodeCoverageAsync(options);
    },
    {
      auto: true,
    },
  ],
});
