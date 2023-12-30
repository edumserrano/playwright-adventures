import { BrowserContext } from "@playwright/test";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

function generateUUID(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function collectIstanbulCodeCoverageAsync(
  context: BrowserContext,
  use: (context: BrowserContext) => Promise<void>,
  outputDir: string,
): Promise<void> {
  await fs.promises.mkdir(outputDir, { recursive: true });
  await context.exposeFunction(
    "collectIstanbulCoverage",
    (coverageJson: string) => {
      if (coverageJson) {
        const codeCoverageFilePath = path.join(
          outputDir,
          `coverage_${generateUUID()}.json`,
        );
        fs.writeFileSync(codeCoverageFilePath, coverageJson);
      }
    },
  );
  await context.addInitScript(() => {
    window.addEventListener("beforeunload", () => {
      const codeCoverage = (window as any).__coverage__;
      const codeCoverageAsJson = JSON.stringify(codeCoverage);
      (window as any).collectIstanbulCoverage(codeCoverageAsJson);
    });
  });

  await use(context);

  for (const page of context.pages()) {
    await page.evaluate(() => {
      const codeCoverage = (window as any).__coverage__;
      const codeCoverageAsJson = JSON.stringify(codeCoverage);
      (window as any).collectIstanbulCoverage(codeCoverageAsJson);
    });
  }
}
