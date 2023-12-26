import { ConsoleMessage, Page } from "@playwright/test";

// Ignore console messages you don't care about.
// For instance, the vite dev server used to serve the Angular 17 app for the tests
// produces some Console Messages we want to ignore.
function isExcluded(consoleMessage: ConsoleMessage): boolean {
  const isExcluded =
    consoleMessage.location().url.includes("/@vite/") ||
    consoleMessage.location().url.includes("/@fs/");
  return isExcluded;
}

export async function captureConsoleMessagesAsync(
  page: Page,
  use: (consoleMessages: ConsoleMessage[]) => Promise<void>,
): Promise<void> {
  const consoleMessages: ConsoleMessage[] = [];
  page.on("console", (consoleMessage: ConsoleMessage) => {
    if (!isExcluded(consoleMessage)) {
      consoleMessages.push(consoleMessage);
    }
  });
  await use(consoleMessages);
}
