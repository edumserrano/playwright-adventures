import { ConsoleMessage, expect } from '@playwright/test';

// This will do 2 things:
// 1) Provide easy access to all console log messages on tests
// 2) Fail the tests if any unexpected console messages are produced. This will
// not only catch warnings from console.log commands left in the code but it will
// also capture errors throw by your code which might not immediatly affect the user
// experience but are still indicative that there is a bug in the app.
//
// Based on ideas from:
// - https://github.com/microsoft/playwright/issues/5546
// - https://github.com/microsoft/playwright/discussions/11690

function isAllowed(consoleMessage: ConsoleMessage): boolean {
  const isAllowed = consoleMessage.text() === "This is an expected console message.";
  return isAllowed;
}

export async function assertConsoleMessagesAsync(
  consoleMessages: readonly ConsoleMessage[],
  use: () => Promise<void>
): Promise<void> {
  await use();
  const unexpectedConsoleMessages = consoleMessages
    .filter((consoleMessage) => !isAllowed(consoleMessage))
    .map((consoleMessage) => {
      return {
        type: consoleMessage.type(),
        text: consoleMessage.text(),
        location: consoleMessage.location(),
      };
    });
  expect(unexpectedConsoleMessages).toEqual([]);
}
