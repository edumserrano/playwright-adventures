import { Browser, Page, test } from '@playwright/test';
import { addCoverageReport } from 'monocart-reporter';

function browserSupportsV8CodeCoverage(
  browserType: string | undefined
): boolean {
  return browserType === 'chromium';
}

// see https://playwright.dev/docs/api/class-coverage
// this instruments code using v8 and then attaches the code coverage data
// to the monocart-reporter. For an example on how to also gather CSS coverage
// see https://github.com/cenfun/monocart-reporter/blob/647fb6bec6204af43fc70e79bf7baef771517329/README.md?plain=1#L678C1-L701C60
export async function collectV8CodeCoverageAsync(
  browser: Browser,
  page: Page,
  use: () => Promise<void>
): Promise<void> {
  const browserType = browser.browserType().name();
  const v8CodeCoverageSupported = browserSupportsV8CodeCoverage(browserType);
  if (v8CodeCoverageSupported) {
    await Promise.all([
      page.coverage.startJSCoverage({ resetOnNavigation: false }),
      page.coverage.startCSSCoverage({ resetOnNavigation: false }),
    ]);
  }

  await use();

  if (v8CodeCoverageSupported) {
    const [jsCoverage, cssCoverage] = await Promise.all([
      page.coverage.stopJSCoverage(),
      page.coverage.stopCSSCoverage(),
    ]);
    const coverageList = [... jsCoverage, ... cssCoverage];
    await addCoverageReport(coverageList, test.info());
  }
}
