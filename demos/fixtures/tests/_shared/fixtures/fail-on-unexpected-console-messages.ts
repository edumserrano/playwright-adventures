import { ConsoleMessage, expect } from "@playwright/test";

function isAllowed(consoleMessage: ConsoleMessage): boolean {
  const isAllowed =
    consoleMessage.text() === "This is an expected console message.";
  return isAllowed;
}

export async function assertConsoleMessagesAsync(
  consoleMessages: ReadonlyArray<ConsoleMessage>,
  use: () => Promise<void>,
): Promise<void> {
  await use();
  const unexpectedConsoleMessages = consoleMessages
    .filter(consoleMessage => !isAllowed(consoleMessage))
    .map(consoleMessage => {
      return {
        type: consoleMessage.type(),
        text: consoleMessage.text(),
        location: consoleMessage.location(),
      };
    });
  expect(unexpectedConsoleMessages).toEqual([]);
}
