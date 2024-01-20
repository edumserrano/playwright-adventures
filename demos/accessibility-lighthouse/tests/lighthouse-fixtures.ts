import { chromium, LaunchOptions, test as baseTest } from "@playwright/test";

export { expect } from "@playwright/test";

/* See https://playwright.dev/docs/test-fixtures, https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures and https://playwright.dev/docs/test-parameterize */

interface LighthouseWorkerFixtures {
  remoteDebuggingPort: number;
}

interface LighthouseTestFixtures {
  autoBrowser: void;
}

export const test = baseTest.extend<
  LighthouseTestFixtures,
  LighthouseWorkerFixtures
>({
  // Lighthouse tests only run on Chromium and require the use of a remote debugging port which can be set
  // via Chromium's --remote-debugging-port launch argument. If not set it defaults to 9222.
  // When running tests in parallel the value for this port must be unique or the tests will fail.
  //
  // The browser fixture below is extended so a Chrome browser is always created using the
  // --remote-debugging-port launch argument.
  browser: async ({ browserName, remoteDebuggingPort }, use) => {
    // Lighthouse test only run on Chromium based browsers
    if (browserName !== "chromium") {
      test.skip();
      return;
    }

    // Override the default browser fixture with one where we can control the
    // launch options so that we can set the --remote-debugging-port arg. See
    // - https://blog.chromium.org/2011/05/remote-debugging-with-chrome-developer.html
    // - https://chromedevtools.github.io/devtools-protocol/
    const launchOptions: LaunchOptions = {
      headless: true,
      args: [`--remote-debugging-port=${remoteDebuggingPort}`],
    };
    const browser = await chromium.launch(launchOptions);
    await use(browser);
    await browser.close();
  },
  // The remoteDebuggingPort fixture below ensures the port will be unique per Playwright test worker.
  remoteDebuggingPort: [
    async ({}, use, workerInfo): Promise<void> => {
      const remoteDebuggingPort = 9500 + workerInfo.workerIndex;
      await use(remoteDebuggingPort);
    },
    { scope: "worker" },
  ],
  // The autoBrowser fixture below is a workaround to transform the built-in browser
  // fixture above into an auto fixture so that a browser instance is always created
  // even when the test doesn't depend on the browser fixture or any other which
  // initializes the browser fixture such as the page fixture.
  //
  // Without this fixture we would have to depend on the browser or page fixtures in
  // all of our tests even when those fixtures aren't used by the Lighthouse tests.
  //
  // DO NOT REMOVE the 'browser' argument from the function below. It's not used but
  // just because it's declared as a dependency of the autoBrowser fixture, it means
  // the browser fixture will be instantiated.
  //
  // In addition to automatically setting up a browser instance, this fixture guarantees
  // that the required baseURL and viewport fixtures are defined so we don't have to
  // check in each test.
  autoBrowser: [
    async ({ browser, baseURL, viewport }, use): Promise<void> => {
      if (!baseURL) {
        throw new Error("baseURL cannot be undefined");
      }

      if (!viewport) {
        throw new Error("viewport cannot be null");
      }

      await use();
    },
    {
      auto: true,
    },
  ],
});
