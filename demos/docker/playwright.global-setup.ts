import { FullConfig } from "@playwright/test";
import { playwrightCliOptions } from "playwright.cli-options";
import { playwrightEnv } from "playwright.env-vars";

// See https://playwright.dev/docs/test-global-setup-teardown#option-2-configure-globalsetup-and-globalteardown

function startupLog(config: FullConfig) {
  console.log(""); // just for the new line
  console.log("Starting playwright tests:");
  console.log(`- Playwright version: ${config.version}`);
  console.log(`- CI: ${playwrightEnv.CI}`);
  console.log(`- SNAPSHOT_DIR: ${playwrightEnv.SNAPSHOT_DIR}`);
  // prettier-ignore
  console.log(`- USE_DOCKER_HOST_WEBSERVER: ${playwrightEnv.USE_DOCKER_HOST_WEBSERVER}`);
  // prettier-ignore
  console.log(`- FILE_CHANGES_DETECTION_SUPPORTED: ${playwrightEnv.FILE_CHANGES_DETECTION_SUPPORTED}`);
  console.log(`- UI mode: ${playwrightCliOptions.UIMode}`);
  console.log(`- update snapshots: ${config.updateSnapshots}`);
  console.log(`- webServer.command: ${config.webServer?.command}`);
  console.log(`- webServer.url: ${config.webServer?.url}`);
  // prettier-ignore
  console.log(`- webServer.reuseExistingServer: ${config.webServer?.reuseExistingServer}`);
  console.log(`- testDir: ${config.projects[0].testDir}`);
  console.log(`- outputDir: ${config.projects[0].outputDir}`);
  const htmlReporter = config.reporter[1];
  if (htmlReporter) {
    const htmlReporterOptions = htmlReporter[1];
    // prettier-ignore
    console.log(`- html reporter outputFolder: ${htmlReporterOptions.outputFolder}`);
  }

  console.log(""); // just for the new line
}

async function globalSetup(config: FullConfig): Promise<void> {
  startupLog(config);
}

export default globalSetup;
