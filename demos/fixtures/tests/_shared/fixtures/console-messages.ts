import { ConsoleMessage, Page } from '@playwright/test';

function isExcluded(consoleMessage: ConsoleMessage): boolean {
  const isExcluded =
    consoleMessage.location().url.includes('/@vite/') ||
    consoleMessage.location().url.includes('/@fs/');
  return isExcluded;
}

export async function captureConsoleMessagesAsync(
  page: Page,
  use: (consoleMessages: ConsoleMessage[]) => Promise<void>
): Promise<void> {
  const consoleMessages: ConsoleMessage[] = [];
  page.on('console', (consoleMessage: ConsoleMessage) => {
    if (!isExcluded(consoleMessage)) {
      consoleMessages.push(consoleMessage);
    }
  });
  await use(consoleMessages);
}
