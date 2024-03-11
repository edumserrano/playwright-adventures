import { ReporterDescription, defineConfig, devices } from "@playwright/test";
import path from "path";
import { playwrightCliOptions } from "playwright.cli-options";
import { playwrightEnv } from "playwright.env-vars";

const _isRunningOnCI = playwrightEnv.CI;
const _webServerPort = 4200;
const _webServerHost = playwrightEnv.USE_DOCKER_HOST_WEBSERVER
  ? `host.docker.internal`
  : `127.0.0.1`;
const _webServerUrl = `http://${_webServerHost}:${_webServerPort}`;

// For more info on the reason for the env.USE_POLL_ON_NG_SERVE see the section
// 'File changes aren't triggering an application rebuild when testing with UI mode' of the
// README at /demos/docker/README.md
const pollOption = playwrightEnv.FILE_CHANGES_DETECTION_SUPPORTED
  ? ""
  : "--poll 1500";
const _webServerCommand = playwrightCliOptions.UIMode
  ? `npx ng serve --host ${_webServerHost} --port ${_webServerPort} ${pollOption}`
  : `npx ng serve --host ${_webServerHost} --port ${_webServerPort} --watch false`;

const _testsDir = path.resolve("./tests");
const _testResultsDir = path.resolve("./test-results");
const _htmlReportDir = path.resolve("playwright-html-report");

let _reporters: ReporterDescription[];
if (playwrightCliOptions.UIMode) {
  // Limit the reporters when running in UI mode.
  // This speeds up UI mode since each reporter takes time creating their report after a test run.
  // For maximum efficiency you could leave the reporters empty when running in UI mode.
  _reporters = [["list"]];
} else {
  _reporters = [
    ["list"],
    [
      /* See https://playwright.dev/docs/test-reporters#html-reporter */
      "html",
      {
        open: "never",
        outputFolder: _htmlReportDir,
      },
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
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: _reporters,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: _webServerUrl,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  /*
   * For snapshotPathTemplate configuration options see https://playwright.dev/docs/api/class-testproject#test-project-snapshot-path-template
   * By default {snapshotDir} is the same as {testDir}.
   * The default snapshotPathTemplate is defined at https://github.com/microsoft/playwright/blob/7bffff5790e28243a815c985135e908247b563db/packages/playwright/src/common/config.ts#L167C5-L167C138
   */
  // prettier-ignore
  snapshotPathTemplate: "{snapshotDir}/{platform}/{projectName}/{testFilePath}/{arg}{ext}",
  /* the path.resolve with "." below is to avoid any issues when passing relative paths for the SNAPSHOT_DIR into the Docker container */
  snapshotDir: path.resolve(".", playwrightEnv.SNAPSHOT_DIR),
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
