import { Config, Flags, RunnerResult } from "lighthouse";
import lighthouse from "lighthouse/core/index.cjs";

// See https://github.com/GoogleChrome/lighthouse and https://github.com/GoogleChrome/lighthouse/blob/main/docs/readme.md
export interface LighthouseResult {
  runnerResult: RunnerResult;
  categoriesResult: LighthouseCategoriesResult;
}

export interface LighthouseCategoriesResult {
  accessibilityScore: number;
  performanceScore: number;
  bestPracticesScore: number;
  seoScore: number;
}

export interface LighthouseAuditOptions {
  url: string;
  remoteDebuggingPort: number;
  viewportWidth: number;
  viewportHeight: number;
}

export class LighthouseAudit {
  public async runAsync(
    lighthouseAuditOptions: LighthouseAuditOptions,
  ): Promise<LighthouseResult> {
    const options: Flags = {
      onlyCategories: ["accessibility", "performance", "best-practices", "seo"],
      output: "html",
      port: lighthouseAuditOptions.remoteDebuggingPort,
    };
    const config: Config = {
      // see https://github.com/GoogleChrome/lighthouse/blob/main/docs/configuration.md
      extends: "lighthouse:default",
      settings: {
        formFactor: "desktop",
        disableFullPageScreenshot: true,
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
          width: lighthouseAuditOptions.viewportWidth,
          height: lighthouseAuditOptions.viewportHeight,
          deviceScaleFactor: 1,
        },
      },
    };
    const runnerResult = await lighthouse(
      lighthouseAuditOptions.url,
      options,
      config,
    );
    if (typeof runnerResult === "undefined") {
      // prettier-ignore
      const errorMessage = "Failed to produce lighthouse report. RunnerResult was undefined.";
      throw new Error(errorMessage);
    }

    const lhr = runnerResult.lhr;
    const accessibilityScore = lhr.categories["accessibility"].score ?? 0;
    const performanceScore = lhr.categories["performance"].score ?? 0;
    const bestPracticesScore = lhr.categories["best-practices"].score ?? 0;
    const seoScore = lhr.categories["seo"].score ?? 0;
    const categoriesResult: LighthouseCategoriesResult = {
      // results are from 0 to 1 meaning 0 to 100 percent, applying scale to make it more obvious
      accessibilityScore: accessibilityScore * 100,
      bestPracticesScore: bestPracticesScore * 100,
      performanceScore: performanceScore * 100,
      seoScore: seoScore * 100,
    };
    const runResult: LighthouseResult = {
      runnerResult,
      categoriesResult,
    };
    return runResult;
  }
}
