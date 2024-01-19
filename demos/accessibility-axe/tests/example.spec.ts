import { test, expect, TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { AxeResults } from "axe-core";

async function attachAxeResultsAsync(
  testInfo: TestInfo,
  axeResults: AxeResults,
): Promise<void> {
  await testInfo.attach("accessibility-scan-results", {
    body: JSON.stringify(axeResults, null, 2),
    contentType: "application/json",
  });
}

// This test will always fail because the app being tested has
// accessibility issues
test("a11y", async ({ page }, testInfo) => {
  await page.goto("/");

  // run the Axe accessibility scan against the page
  const axeResults = await new AxeBuilder({ page }).analyze();

  // export scan results as a test attachment
  await attachAxeResultsAsync(testInfo, axeResults);

  // verify that there are no violations in the returned scan results
  expect(axeResults.violations).toEqual([]);
});

// This test shows how to exclude rules from the accessibility scan.
// It's the same as the above but it passes due to the 'color-contrast'
// rule exclusion
test("a11y with exclusions", async ({ page }, testInfo) => {
  await page.goto("/");

  // run the Axe accessibility scan against the page
  const axeResults = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();

  // export scan results as a test attachment
  await attachAxeResultsAsync(testInfo, axeResults);

  // verify that there are no violations in the returned scan results
  expect(axeResults.violations).toEqual([]);
});
