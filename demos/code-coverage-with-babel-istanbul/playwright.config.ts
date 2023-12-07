import { defineConfig, devices } from '@playwright/test';
import { ReportDescription } from 'monocart-coverage-reports';
import * as path from 'path';
import { env } from 'tests/_shared/process-env';

const _isRunningOnCI = env.CI;
const _webServerPort = 4200;
const _webServerHost = '127.0.0.1';
const _webServerUrl = `http://${_webServerHost}:${_webServerPort}`;
const _testsDir = path.resolve('./tests'); // set to ./tests
const _testsOutputBaseDir = path.resolve(_testsDir, 'test-results'); // set to ./tests/test-results
const _monocartCodeCoverageBaseDir = path.resolve(_testsOutputBaseDir, 'code-coverage'); // set to ./tests/test-results/code-coverage
const _v8RelativeFilePath = 'v8/index.html';

// The paths in the codeCoverageReports variable are all
// relative to monocart-reporter coverage.outputDir which is
// set to ./tests/test-results/code-coverage
const _codeCoverageReports: ReportDescription[] = [
  ['v8'],
  [
    'cobertura',
    {
      file: 'cobertura/code-coverage.cobertura.xml', // it will be generated at ./tests/test-results/code-coverage/cobertura/code-coverage.cobertura.xml
    },
  ],
  [
    'lcovonly',
    {
      file: 'lcov/code-coverage.lcov.info', // it will be generated at ./tests/test-results/code-coverage/lcov/code-coverage.lcov.info
    },
  ],
  [
    'html-spa',
    {
      subdir: 'html-spa-report', // it will be generated at ./tests/test-results/code-coverage/html-spa-report
    },
  ],
];

// See https://playwright.dev/docs/test-configuration.
export default defineConfig({
  testDir: _testsDir,
  outputDir: _testsOutputBaseDir,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!_isRunningOnCI,
  /* Retry on CI only */
  retries: _isRunningOnCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: _isRunningOnCI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    [
      // See https://github.com/cenfun/monocart-reporter
      'monocart-reporter',
      {
        name: 'playwright code coverage demo with monocart reporter',
        outputFile: path.resolve(_testsOutputBaseDir, 'monocart-report.html'), // set to ./tests/test-results/monocart-report.html
        coverage: {
          // for documentation on the monocart code coverage options see https://github.com/cenfun/monocart-reporter#code-coverage-report, https://github.com/cenfun/monocart-coverage-reports and https://github.com/cenfun/monocart-coverage-reports/blob/main/lib/index.d.ts
          outputDir: _monocartCodeCoverageBaseDir, // all reports in this dir. Set to ./tests/test-results/code-coverage
          outputFile: _v8RelativeFilePath, // v8 sub dir and html file name, relative to coverage.outputDir. Set to ./tests/test-results/code-coverage/v8/index.html
          reportPath: path.resolve(_monocartCodeCoverageBaseDir, _v8RelativeFilePath), // global code coverage html report filepath linked to the monocart test results. Set to ./tests/test-results/code-coverage/v8/index.html
          reports: _codeCoverageReports,
          inline: true, // inline all scripts required for the V8 html report into a single HTML file.
          entryFilter: (entry: any) => {
            // Exclude files that aren't part of the src folder.
            // There aren't excluded by sourceFilter because they are not included in the sourcemap
            // See https://github.com/cenfun/monocart-reporter/issues/60
            const url = entry.url as string;
            return (
              !url.includes('@vite') &&
              !url.includes('@fs') &&
              !url.includes('fonts.googleapis.com')
              // && url !== 'http://127.0.0.1:4200/styles.css'
            );
          },
          sourceFilter: (sourcePath: string) => {
            return sourcePath.search(/src\//u) !== -1; // only include files under src folder
          },
        },
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: _webServerUrl,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

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
