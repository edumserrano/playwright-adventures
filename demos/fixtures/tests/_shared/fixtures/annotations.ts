import { Browser, Page, test } from '@playwright/test';

export async function addTestAnnotationsAsync(
  browser: Browser,
  page: Page,
  headless: boolean,
  use: () => Promise<void>
): Promise<void> {
  // See https://playwright.dev/docs/test-annotations#custom-annotations
  const viewportSize = page.viewportSize();
  const annotations = test.info().annotations;
  annotations.push(
    {
      type: 'browser',
      description: `${browser.browserType().name()} v${browser.version()}`,
    },
    {
      type: 'viewport',
      description: `${viewportSize?.width ?? 0}x${viewportSize?.height ?? 0}`,
    },
    {
      type: 'headless',
      description: `${headless ? 'yes' : 'no'}`,
    }
  );
  await use();
}
