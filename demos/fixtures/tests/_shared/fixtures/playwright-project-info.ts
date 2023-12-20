import { test } from '@playwright/test';
import { PlaywrightProjectName } from 'playwright.config';

export async function setupPlaywrightProjectInfo(
  use: (playwrightProjectName: PlaywrightProjectName) => Promise<void>
): Promise<void> {
  const projectName = test.info().project.name as PlaywrightProjectName;
  await use(projectName);
}
