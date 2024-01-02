// Note that the 'test' and 'expect' imports are coming from the app-fixtures.ts instead of from
// @playwright/test.
//
// This is why we can use the fixtures in these tests.
import { PlaywrightProjectName } from "playwright.config";
import { expect, test } from "tests/_shared/app-fixtures";

// This test shows the `setDate` fixture.
// See demos\fixtures\tests\_shared\fixtures\set-date.ts.
//
// The code at demos\fixtures\src\app\app.component.ts sets
// the `currentDate` variable based on the current Date but
// the `setDate` fixture will override the current Date with
// a fake test date so that the assert on the text field
// always works.
test("setDate", async ({ page }) => {
  await page.goto("/");
  const messageLocator = page.getByText("Congratulations! Your app is");
  await expect(messageLocator).toHaveText(
    "Congratulations! Your app is running and it's Sat Jan 20 2024.",
  );
});

// This test shows the consoleMessages and failOnUnexpectedConsoleMessages fixtures.
// See:
// - demos\fixtures\tests\_shared\fixtures\console-messages.ts
// - demos\fixtures\tests\_shared\fixtures\fail-on-unexpected-console-messages.ts
//
// It shows how you can assert on console messages.
//
// Also note, that this test is passing even though the demos\fixtures\src\app\app.component.ts
// constructor is producing a Console Message. This is because the console message
// is in the allowed list of the consoleMessages fixture.
//
// However, if you added another console log the tests would fail because of the
// failOnUnexpectedConsoleMessages fixture.
test("consoleMessages and failOnUnexpectedConsoleMessages", async ({
  page,
  consoleMessages,
}) => {
  await page.goto("/");
  expect(consoleMessages.length).toBe(1);
  expect(consoleMessages[0].text()).toBe(
    "This is an expected console message.",
  );
});

// This test will always fail.
// It shows the failOnUnexpectedConsoleMessages fixture.
// See demos\fixtures\tests\_shared\fixtures\fail-on-unexpected-console-messages.ts
test("failOnUnexpectedConsoleMessages", async ({ page }) => {
  // Navigate to an html page declared inline that produces an unexpected console message.
  await page.goto('data:text/html,<script>console.log("Hello!")</script>');
});

// This test will always fail.
// It shows how you can assert on uncaught exceptions within the page using the
// uncaughtExceptions fixture.
// See demos\fixtures\tests\_shared\fixtures\page-errors.ts
test("uncaughtExceptions", async ({ page, uncaughtExceptions }) => {
  // Navigate to an html page declared inline that produces an uncaught exception.
  await page.goto('data:text/html,<script>throw new Error("Test")</script>');
  expect(uncaughtExceptions.length).toBe(0);
});

// This test will always fail.
// It shows that the failOnUncaughtExceptions fixture will fail the test if
// there are any uncaught page exceptions.
// See demos\fixtures\tests\_shared\fixtures\fail-on-page-errors.ts.
test("failOnUncaughtExceptions", async ({ page }) => {
  // Navigate to an html page declared inline that produces an uncaught exception.
  await page.goto('data:text/html,<script>throw new Error("Test")</script>');
});

// This test shows how you can use the projectName fixture.
test("projectName", async ({ page, projectName }) => {
  if (projectName === PlaywrightProjectName.DesktopWebkit1280x720) {
    test.skip();
  }

  await page.goto("/");
  const messageLocator = page.getByText("Congratulations! Your app is");
  await expect(messageLocator).toHaveText(
    "Congratulations! Your app is running and it's Sat Jan 20 2024.",
  );
});
