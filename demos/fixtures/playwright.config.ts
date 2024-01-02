import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { playwrightCliOptions } from "playwright.cli-options";
import { env } from "playwright.env-vars";

export enum PlaywrightProjectName {
  DesktopChromium1280x720 = "desktop chromium 1280x720",
  DesktopFirefox1280x720 = "desktop firefox 1280x720",
  DesktopWebkit1280x720 = "desktop webkit 1280x720",
}

const _isRunningOnCI = env.CI;
const _webServerPort = 4200;
const _webServerHost = "127.0.0.1";
const _webServerUrl = `http://${_webServerHost}:${_webServerPort}`;
const _webServerCommand = playwrightCliOptions.UIMode
  ? `npx ng serve --host ${_webServerHost} --port ${_webServerPort}`
  : `npx ng serve --host ${_webServerHost} --port ${_webServerPort} --watch false`;

// See https://playwright.dev/docs/test-configuration.
export default defineConfig({
  testDir: path.resolve("./tests"),
  outputDir: path.resolve("./test-results"),
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !_isRunningOnCI,
  /* Retry on CI only */
  retries: _isRunningOnCI ? 2 : 0,
  /* See https://playwright.dev/docs/ci#workers */
  workers: undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["list"],
    /* See https://playwright.dev/docs/test-reporters#html-reporter */
    [
      "html",
      {
        open: "never",
        outputFolder: path.resolve("playwright-html-report"),
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: _webServerUrl,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: PlaywrightProjectName.DesktopChromium1280x720,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: PlaywrightProjectName.DesktopFirefox1280x720,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: PlaywrightProjectName.DesktopWebkit1280x720,
      use: { ...devices["Desktop Safari"] },
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: {
    command: _webServerCommand,
    url: _webServerUrl,
    reuseExistingServer: !_isRunningOnCI,
    stdout: "pipe",
    timeout: 3 * 60 * 1000, // 3 min
  },
});
