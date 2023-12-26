import { expect } from "@playwright/test";

export async function assertUncaughtExceptionsAsync(
  uncaughtExceptions: ReadonlyArray<Error>,
  use: () => Promise<void>,
): Promise<void> {
  await use();
  const uncaughtExceptionsDtos = uncaughtExceptions.map(error => {
    return {
      message: error.message,
      cause: error.cause,
      name: error.name,
      stack: error.stack,
    };
  });
  expect(uncaughtExceptionsDtos).toEqual([]);
}
