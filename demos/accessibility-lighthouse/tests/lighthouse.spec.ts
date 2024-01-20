import { attachAuditReport } from "monocart-reporter";
import { expect, test } from "tests/lighthouse-fixtures";
import {
  LighthouseAuditOptions,
  lighthouseAuditAsync,
} from "tests/lighthouse-audit";

test("a11y", async ({ remoteDebuggingPort, viewport, baseURL }) => {
  const { categoriesResult, runnerResult } =
    await test.step("lighthouse audit", () => {
      // it's safe to use the ! operator in baseURL! and viewport! below
      // because we check that these have a value in the autoBrowser
      // fixture at /tests/lighthouse-fixtures.ts
      const options: LighthouseAuditOptions = {
        remoteDebuggingPort: remoteDebuggingPort,
        url: baseURL!,
        viewportHeight: viewport!.height,
        viewportWidth: viewport!.width,
      };
      return lighthouseAuditAsync(options);
    });
  await attachAuditReport(runnerResult, test.info());

  expect(categoriesResult.performanceScore).toBeGreaterThanOrEqual(80);
  expect(categoriesResult.accessibilityScore).toBeGreaterThanOrEqual(80);
  expect(categoriesResult.seoScore).toBeGreaterThanOrEqual(80);
  expect(categoriesResult.bestPracticesScore).toBeGreaterThanOrEqual(80);
});
