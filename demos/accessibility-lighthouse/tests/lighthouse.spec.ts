import { Page } from "@playwright/test";
import { attachAuditReport } from "monocart-reporter";
import { expect, test } from "tests/lighthouse-fixtures";
import {
  LighthouseAudit,
  LighthouseAuditOptions,
  LighthouseResult,
} from "tests/lighthouse-audit";

async function lighthouseAuditAsync(
  page: Page,
  remoteDebuggingPort: number,
): Promise<LighthouseResult> {
  const viewportSize = page.viewportSize();
  if (!viewportSize) {
    throw new Error("page.viewportSize cannot be null");
  }

  const lighthouseAudit = new LighthouseAudit();
  const lighthouseAuditOptions: LighthouseAuditOptions = {
    url: page.url(),
    remoteDebuggingPort: remoteDebuggingPort,
    viewportHeight: viewportSize.height,
    viewportWidth: viewportSize.width,
  };
  return await lighthouseAudit.runAsync(lighthouseAuditOptions);
}

test("a11y", async ({ page, remoteDebuggingPort }, testInfo) => {
  await page.goto("/");

  const { categoriesResult, runnerResult } =
    await test.step("lighthouse audit", () => {
      return lighthouseAuditAsync(page, remoteDebuggingPort);
    });

  await attachAuditReport(runnerResult, test.info());

  expect(categoriesResult.performanceScore).toBeGreaterThanOrEqual(80);
  expect(categoriesResult.accessibilityScore).toBeGreaterThanOrEqual(80);
  expect(categoriesResult.seoScore).toBeGreaterThanOrEqual(80);
  expect(categoriesResult.bestPracticesScore).toBeGreaterThanOrEqual(80);
});
