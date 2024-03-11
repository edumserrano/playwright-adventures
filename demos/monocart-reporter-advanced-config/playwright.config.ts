import { ReporterDescription, defineConfig, devices } from "@playwright/test";
import path from "path";
import { playwrightCliOptions } from "playwright.cli-options";
import { playwrightEnv } from "playwright.env-vars";
import { getMonocartReporterOptions } from "playwright.monocart-reporter";

const _isRunningOnCI = playwrightEnv.CI;
const _webServerPort = 4200;
const _webServerHost = "127.0.0.1";
const _webServerUrl = `http://${_webServerHost}:${_webServerPort}`;
const _webServerCommand = playwrightCliOptions.UIMode
  ? `npx ng serve --host ${_webServerHost} --port ${_webServerPort}`
  : `npx ng serve --host ${_webServerHost} --port ${_webServerPort} --watch false`;

const _testsDir = path.resolve("./tests");
const _testResultsDir = path.resolve("./test-results");

let _reporters: ReporterDescription[];
if (playwrightCliOptions.UIMode) {
  // Limit the reporters when running in UI mode.
  // This speeds up UI mode since each reporter takes time creating their report after a test run.
  // For maximum efficiency you could leave the reporters empty when running in UI mode.
  _reporters = [
    ["list"],
  ];
} else {
  _reporters = [
    ["list"],
    [
      // See https://github.com/cenfun/monocart-reporter
      "monocart-reporter",
      getMonocartReporterOptions(_testResultsDir),
    ],
  ];
}

// See https://playwright.dev/docs/test-configuration.
export default defineConfig({
  testDir: _testsDir,
  outputDir: _testResultsDir,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !_isRunningOnCI,
  /* Retry on CI only */
  retries: _isRunningOnCI ? 2 : 0,
  /* See https://playwright.dev/docs/ci#workers */
  workers: undefined,
  /* See https://playwright.dev/docs/test-global-setup-teardown#option-2-configure-globalsetup-and-globalteardown */
  globalSetup: require.resolve("./playwright.global-setup.ts"),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: _reporters,
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
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
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
