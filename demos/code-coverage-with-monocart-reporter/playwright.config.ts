import { defineConfig, devices } from '@playwright/test';
import { ReportOptions } from 'istanbul-reports';
// import { IstanbulReportConfig } from 'monocart-reporter';
import * as path from 'path';

// function createIstanbulReportConfig<T extends keyof ReportOptions>(
//   name: T,
//   options?: Partial<ReportOptions[T]>
// ): IstanbulReportConfig {
//   return { name, options };
// }

const isRunningOnCI = process.env.CI;
const _webServerPort = 4200;
const _webServerHost = '127.0.0.1';
const _webServerUrl = `http://${_webServerHost}:${_webServerPort}`;
const _testsDir = path.resolve('./tests');
const _testsOutputBaseDir = path.resolve(_testsDir, 'test-results');
const _monocartReportOutputFile = path.resolve(_testsOutputBaseDir,'monocart-report.html');
const _monocartCodeCoverageBaseDir = path.resolve(_testsOutputBaseDir,'code-coverage');
const _v8RelativeFilePath = 'v8/index.html';


// const b: ReportDescription;

// const instanbulReporters: IstanbulReportConfig[] = [
//   createIstanbulReportConfig('cobertura', {
//     file: 'code-coverage.cobertura.xml',
//   }),
//   createIstanbulReportConfig('lcovonly', {
//     file: 'code-coverage.lcov.info',
//   }),
//   createIstanbulReportConfig('html-spa', {
//     // subdir: "code-coverage-html-spa-report",
//   }),
// ];

// See https://playwright.dev/docs/test-configuration.
export default defineConfig({
  testDir: _testsDir,
  outputDir: _testsOutputBaseDir,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!isRunningOnCI,
  /* Retry on CI only */
  retries: isRunningOnCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: isRunningOnCI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    [
      // See https://github.com/cenfun/monocart-reporter
      'monocart-reporter',
      {
        name: 'playwright code coverage with monocart reporter',
        outputFile: _monocartReportOutputFile,
        coverage: {
          outputDir: _monocartCodeCoverageBaseDir, // all reports in this dir
          outputFile: _v8RelativeFilePath, // v8 sub dir and html file name, relative to coverage.outputDir
          reportPath: path.resolve(_monocartCodeCoverageBaseDir, _v8RelativeFilePath),
          reports: [
            ['v8'],
            ['cobertura', {
              file: 'cobertura/code-coverage.cobertura.xml', // path relative to coverage.outputDir
            }],
            ['lcovonly', {
              file: 'lcov/code-coverage.lcov.info', // path relative to coverage.outputDir
            }],
            ['html-spa', {
              subdir: 'html-spa-report', // path relative to coverage.outputDir
            }],
          ],
          entryFilter: (entry: any) => {
            // Exclude files that aren't part of the src folder.
            // There aren't excluded by sourceFilter because they are not included in the sourcemap
            // See https://github.com/cenfun/monocart-reporter/issues/60
            const url = entry.url as string;
            return !url.includes('@vite')
              && !url.includes('@fs')
              && !url.includes('fonts.googleapis.com')
              // && url !== 'http://127.0.0.1:4200/styles.css'
              ;
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
    reuseExistingServer: !isRunningOnCI,
    stdout: 'pipe',
    timeout: 1 * 60 * 1000, // 1 min
  },
});
