import { test } from "@playwright/test";
import { PlaywrightProjectNames } from "playwright.config";

export interface PlaywrightProjectInfo {
  isDesktopChromiumOnly1920x1080: boolean;
  isDesktopChromium2560x1440: boolean;
  isDesktopChromium1920x1080: boolean;
  isDesktopFirefox1920x1080: boolean;
  isDesktopSafari1920x1080: boolean;
  isDesktopChromium1366x1080: boolean;
  isIPadMiniLandscape: boolean;
  isIPadMini: boolean;
  isIPhone11Pro: boolean;
}

export async function setupPlaywrightProjectInfo(
    use: (p: PlaywrightProjectInfo) => Promise<void>,
): Promise<void> {
  const projectName = test.info().project.name;
  const projectInfo: PlaywrightProjectInfo = {
      isDesktopChromiumOnly1920x1080:
          projectName === PlaywrightProjectNames.desktopChromiumOnly1920x1080.toString(),
      isDesktopChromium2560x1440:
          projectName === PlaywrightProjectNames.desktopChromium2560x1440.toString(),
      isDesktopChromium1920x1080:
          projectName === PlaywrightProjectNames.desktopChromium1920x1080.toString(),
      isDesktopFirefox1920x1080:
          projectName === PlaywrightProjectNames.desktopFirefox1920x1080.toString(),
      isDesktopSafari1920x1080:
          projectName === PlaywrightProjectNames.desktopSafari1920x1080.toString(),
      isDesktopChromium1366x1080:
          projectName === PlaywrightProjectNames.desktopChromium1366x1080.toString(),
      isIPadMiniLandscape: projectName === PlaywrightProjectNames.iPadMiniLandscape.toString(),
      isIPadMini: projectName === PlaywrightProjectNames.iPadMini.toString(),
      isIPhone11Pro: projectName === PlaywrightProjectNames.iPhone11Pro.toString(),
  };
  await use(projectInfo);
}
