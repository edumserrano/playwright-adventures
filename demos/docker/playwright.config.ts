import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { env } from 'playwright.env-vars';

const _isRunningOnCI = env.CI;
const _webServerPort = 4200;
const _webServerHost = env.USE_DOCKER_HOST_WEBSERVER ? `host.docker.internal` : `127.0.0.1`;
const _webServerUrl = `http://${_webServerHost}:${_webServerPort}`;
const _testsDir = path.resolve('./tests'); // set to ./tests
const _testResultsDir = path.resolve(_testsDir, 'test-results'); // set to ./tests/test-results
const _htmlReportDir = path.resolve(_testsDir, 'html-report'); // set to ./tests/html-report

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
  /*
   * Note that the default config opts out of parallel tests on CI by doing 'workers: _isRunningOnCI ? 1 : undefined'
   * The default config does this because:
   *
   * We recommend setting workers to "1" in CI environments to prioritize stability and reproducibility.
   * Running tests sequentially ensures each test gets the full system resources, avoiding potential conflicts.
   * However, if you have a powerful self-hosted CI system, you may enable parallel tests.
   * For wider parallelization, consider sharding - distributing tests across multiple CI jobs.
   *
   * It's up to you to check if you can run in parallel or not on CI. Not that your overall test
   * execution speed can vary significantly if you can run tests in parallel.
   * See https://playwright.dev/docs/ci#workers.
   */
  workers: undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    [
      /* See https://playwright.dev/docs/test-reporters#html-reporter */
      'html',
      {
        open: 'never',
        outputFolder: _htmlReportDir,
      }
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: _webServerUrl,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* For snapshotPathTemplate configuration options see https://playwright.dev/docs/api/class-testproject#test-project-snapshot-path-template */
  snapshotPathTemplate: "{testDir}/_snapshots/{platform}/{projectName}/{testFilePath}/{arg}{ext}",
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: {
    command: `npx ng serve --host ${_webServerHost} --port ${_webServerPort} --watch false`,
    url: _webServerUrl,
    reuseExistingServer: !_isRunningOnCI,
    stdout: 'pipe',
    timeout: 1 * 60 * 1000, // 1 min
  },
});