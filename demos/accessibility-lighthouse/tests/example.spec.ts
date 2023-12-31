import {
  // test,
  LaunchOptions,
  chromium,
  TestInfo,
  Page,
} from "@playwright/test";

import { expect, test } from "tests/lighthouse-fixtures";

import { playAudit, playwrightLighthouseResult } from "playwright-lighthouse";
import { Config, Flags, RunnerResult } from "lighthouse";

async function attachLighthouseResultsAsync(
  testInfo: TestInfo,
  playwrightLighthouseResult: playwrightLighthouseResult,
): Promise<void> {
  await testInfo.attach("accessibility-scan-results", {
    body: JSON.stringify(playwrightLighthouseResult.lhr, null, 2),
    contentType: "application/json",
  });
}

async function lighthouseAuditAsync(
  page: Page,
  port: number,
): Promise<playwrightLighthouseResult> {
  // const config: Config = {
  //   // see https://github.com/GoogleChrome/lighthouse/blob/main/docs/configuration.md
  //   extends: "lighthouse:default",
  //   settings: {
  //     formFactor: "desktop",
  //     throttling: {
  //       // disable any network or cpu throttling from the default config
  //       // see https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md
  //       rttMs: 0,
  //       throughputKbps: 0,
  //       cpuSlowdownMultiplier: 1,
  //       requestLatencyMs: 0,
  //       downloadThroughputKbps: 0,
  //       uploadThroughputKbps: 0,
  //     },
  //     screenEmulation: {
  //       // see https://github.com/GoogleChrome/lighthouse/blob/main/docs/emulation.md
  //       mobile: false,
  //       width: 1,
  //       height: 2,
  //       deviceScaleFactor: 1,
  //     },
  //   },
  // };

  const lighthouseReport = await playAudit({
    // page: page,
    url: page.url(),
    port: port,
    reports: {
      formats: {
        // json: true, //defaults to false
        html: true, //defaults to false
        // csv: true, //defaults to false
      },
      name: `my-lighthouse-demo-report`, //defaults to `lighthouse-${new Date().getTime()}`
      // directory: `path/to/directory`, //defaults to `${process.cwd()}/lighthouse`
    },
    thresholds: {
      "best-practices": 10,
      accessibility: 10,
      performance: 10,
      pwa: 10,
      seo: 10,
    },
    config: {
      // see https://github.com/GoogleChrome/lighthouse/blob/main/docs/configuration.md
      extends: "lighthouse:default",
      settings: {
        formFactor: "desktop",
        throttling: {
          // disable any network or cpu throttling from the default config
          // see https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md
          rttMs: 0,
          throughputKbps: 0,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
        screenEmulation: {
          // see https://github.com/GoogleChrome/lighthouse/blob/main/docs/emulation.md
          mobile: false,
          width: page.viewportSize()?.width,
          height: page.viewportSize()?.height,
          deviceScaleFactor: 1,
        },
        // disableFullPageScreenshot: true,
      },
    },
  });
  return lighthouseReport;
}

test.skip("a11y", async ({page, remoteDebuggingPort}, testInfo) => {
  // const remoteDebuggingPort = 9522;
  // const launchOptions: LaunchOptions = {
  //   headless: true,
  //   args: [`--remote-debugging-port=${remoteDebuggingPort}`],
  // };
  // const browser = await chromium.launch(launchOptions);
  // const page = await browser.newPage();

  // this relative navigation is possible because of the baseURL
  // property that is configured int the playwright.config.ts
  await page.goto("/");

  const playwrightLighthouseReport =
    await test.step("lighthouse audit", async () => {
      return await lighthouseAuditAsync(page, remoteDebuggingPort);
    });

  // const playwrightLighthouseReport = await lighthouseAuditAsync(page);

  // await attachLighthouseResults(testInfo, lighthouseReport);
  // await browser.close();
});

// test("a11y with exclusions", async ({ page }, testInfo) => {
//   // this relative navigation is possible because of the baseURL
//   // property that is configured int the playwright.config.ts
//   await page.goto("/");

//   // run the Axe accessibility scan against the page
//   const axeResults = await new AxeBuilder({ page })
//     .disableRules(["color-contrast"])
//     .analyze();

//   // export scan results as a test attachment
//   await attachAxeResults(testInfo, axeResults);

//   // verify that there are no violations in the returned scan results
//   expect(axeResults.violations).toEqual([]);
// });
