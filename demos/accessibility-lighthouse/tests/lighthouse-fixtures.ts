import { chromium, LaunchOptions, test as baseTest } from "@playwright/test";

export { expect } from "@playwright/test";

/* See https://playwright.dev/docs/test-fixtures, https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures and https://playwright.dev/docs/test-parameterize */

interface LighthouseWorkerFixtures {
  remoteDebuggingPort: number;
}

interface LighthouseTestFixtures {}

/*
 * Lighthouse tests only run on Chromium and require the use of a remote debugging port which can be set
 * via Chromium's --remote-debugging-port launch argument. If not set it defaults to 9222.
 * When running tests in parallel the value for this port must be unique or the tests will fail.
 */
// prettier-ignore
export const test = baseTest.extend<LighthouseTestFixtures,LighthouseWorkerFixtures>({
    browser: async ({ remoteDebuggingPort }, use) => {
        const launchOptions: LaunchOptions = {
            headless: true,
            args: [`--remote-debugging-port=${remoteDebuggingPort}`],
        };
        const browser = await chromium.launch(launchOptions);
        await use(browser);
        await browser.close();
    },
    remoteDebuggingPort: [
        async ({}, use, workerInfo): Promise<void> => {
            const remoteDebuggingPort = 9500 + workerInfo.workerIndex;
            await use(remoteDebuggingPort);
        },
        { scope: "worker" },
    ],
});
