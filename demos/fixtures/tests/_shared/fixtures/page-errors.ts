import { Page } from '@playwright/test';

export async function capturePageErrorsAsync(
  page: Page,
  use: (uncaughtExceptions: Error[]) => Promise<void>
): Promise<void> {
  const uncaughtExceptions: Error[] = [];
  page.on('pageerror', (error: Error) => {
    uncaughtExceptions.push(error);
  });
  await use(uncaughtExceptions);
}
