import { BrowserType, Page, test } from "@playwright/test";
import { addCoverageReport } from "monocart-reporter";

export type CollectV8CodeCoverageOptions = {
  browserType: BrowserType;
  page: Page;
  use: () => Promise<void>;
  enableJsCoverage: boolean;
  enableCssCoverage: boolean;
};

function browserSupportsV8CodeCoverage(browserType: BrowserType): boolean {
  return browserType.name() === "chromium";
}

// See https://playwright.dev/docs/api/class-coverage.
// This instruments code using v8 and then attaches the code coverage data
// to the monocart-reporter.
export async function collectV8CodeCoverageAsync(
  options: CollectV8CodeCoverageOptions,
): Promise<void> {
  // prettier-ignore
  const v8CodeCoverageSupported = browserSupportsV8CodeCoverage(options.browserType);
  // prettier-ignore
  const codeCoverageEnabled = options.enableJsCoverage || options.enableCssCoverage;
  if (!v8CodeCoverageSupported || !codeCoverageEnabled) {
    await options.use();
    return;
  }

  const page = options.page;
  let startCoveragePromises: Promise<void>[] = [];
  // When collecting code coverage make sure the 'resetOnNavigation' is set to false.
  // Otherwise, if the test contains page navigations then only the coverage for the
  // last page navigation is recorded.
  if (options.enableJsCoverage) {
    const startJsCoveragePromise = page.coverage.startJSCoverage({
      resetOnNavigation: false,
    });
    startCoveragePromises.push(startJsCoveragePromise);
  }
  if (options.enableCssCoverage) {
    const startCssCoveragePromise = page.coverage.startCSSCoverage({
      resetOnNavigation: false,
    });
    startCoveragePromises.push(startCssCoveragePromise);
  }

  await Promise.all(startCoveragePromises);
  await options.use();

  let stopCoveragePromises: Promise<any>[] = [];
  if (options.enableJsCoverage) {
    const stopJsCoveragePromise = page.coverage.stopJSCoverage();
    stopCoveragePromises.push(stopJsCoveragePromise);
  }
  if (options.enableCssCoverage) {
    const stopCssCoveragePromise = page.coverage.stopCSSCoverage();
    stopCoveragePromises.push(stopCssCoveragePromise);
  }

  const coverageReports = await Promise.all(stopCoveragePromises);
  await addCoverageReport(coverageReports.flat(), test.info());
}
