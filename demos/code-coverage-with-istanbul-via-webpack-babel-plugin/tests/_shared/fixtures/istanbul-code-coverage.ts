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
    await context.addInitScript(() => {
        window.addEventListener("beforeunload", () =>
            (window as any).collectIstanbulCoverage(JSON.stringify((window as any).__coverage__)),
        );
    });
    await fs.promises.mkdir(outputDir, { recursive: true });
    await context.exposeFunction("collectIstanbulCoverage", (coverageJSON: string) => {
        if (coverageJSON) {
            fs.writeFileSync(
                path.join(outputDir, `coverage_${generateUUID()}.json`),
                coverageJSON,
            );
        }
    });

    await use(context);

    for (const page of context.pages()) {
        await page.evaluate(() =>
            (window as any).collectIstanbulCoverage(JSON.stringify((window as any).__coverage__)),
        );
    }
}
