import { expect, test } from "@playwright/test";

test('screenshot', async ({ page }) => {
  // this relative navigation is possible because of the baseURL
  // property that is configured int the playwright.config.ts
  await page.goto('/');
  await expect(page).toHaveScreenshot();
});

// comment this test and you'll see reduced code coverage on the
// src/app/app.component.ts file
test('press me without ctrl modifier', async ({ page }) => {
  let dialogMessage = '';
  page.on('dialog', dialog => {
    dialogMessage = dialog.message();
    dialog.accept()
  });

  await page.goto('/');
  const pressMeButton =  page.getByRole('button', { name: 'Press me' });
  await pressMeButton.click();

  expect(dialogMessage).toBe("button pressed without ctrl key modifier");
});

// comment this test and you'll see reduced code coverage on the
// src/app/app.component.ts file
test('press me with ctrl modifier', async ({ page }) => {
  let dialogMessage = '';
  page.on('dialog', dialog => {
    dialogMessage = dialog.message();
    dialog.accept()
  });

  await page.goto('/');
  const pressMeButton =  page.getByRole('button', { name: 'Press me' });
  await pressMeButton.click({ modifiers: ['Control'] });

  expect(dialogMessage).toBe("button pressed with ctrl key modifier");
});