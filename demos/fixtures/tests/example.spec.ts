import { test, expect } from 'tests/_shared/app-fixtures';

test('test-one', async ({ page, consoleMessages }) => {
  // this relative navigation is possible because of the baseURL
  // property that is configured int the playwright.config.ts
  await page.goto('/');
  await expect(page).toHaveScreenshot();
  expect(consoleMessages.length).toBe(1);
  expect(consoleMessages[0].text()).toBe('This is an expected console message.');
});

test('test-two', async ({ page, projectName }) => {
  if(projectName === 'desktop webkit 1280x720') {
    test.skip();
  }

  // this relative navigation is possible because of the baseURL
  // property that is configured int the playwright.config.ts
  await page.goto('/');
  await expect(page).toHaveScreenshot();
});

test('test-three', async ({ page }) => {
  // Navigate to a page with an exception.
  await page.goto('data:text/html,<script>throw new Error("Test")</script>');
});
