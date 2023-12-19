import { Browser, ConsoleMessage, expect, Page } from "@playwright/test";

export interface ConsoleMessageData {
    type: string;
    text: string;
}

// This will do 2 things:
// 1) Provide easy access to all console log messages on tests
// 2) Fail the tests if any unexpected console messages are produced. This will
// not only catch warnings from console.log commands left in the code but it will
// also capture errors throw by your code which might not immediatly affect the user
// experience but are still indicative that there is a bug in the app.
//
// Based on ideas from:
// - https://github.com/microsoft/playwright/issues/5546
// - https://github.com/microsoft/playwright/discussions/11690

export async function captureAndAssertConsoleLogsAsync(
    browser: Browser,
    page: Page,
    use: (consoleMessages: ConsoleMessageData[]) => Promise<void>,
): Promise<void> {
    const unexpectedConsoleMessages: ConsoleMessage[] = [];
    const consoleMessages: ConsoleMessageData[] = [];
    page.on("console", msg => {
        const messageData: ConsoleMessageData = {
            type: msg.type(),
            text: msg.text(),
        };
        consoleMessages.push(messageData);

        // ignore some console messages that don't originate in our code.
        // - polyfills.js sometimes generates console logs when serving via ng serve. Stuff like:
        // [webpack-dev-server] Server started: Hot Module Replacement disabled, Live Reloading enabled, Progress disabled, Overlay enabled.
        // - It's also possible to sometimes get "WebSocket connection to 'ws://127.0.0.1:4200/ng-cli-ws' failed: Error receiving data: Connection reset by peer"
        // and that message has an empty URL.
        const isExcluded =
            msg.location().url === "" ||
            msg.location().url.endsWith("polyfills.js") ||
            msg.location().url.endsWith("vendor.js") ||
            msg.text().startsWith("[webpack-dev-server]") ||
            msg.text().startsWith("[WebSocket connection to]") ||
            msg.text().startsWith("Parse institutions error") || // logged as a console error by the error page
            (browser.browserType().name() === "firefox" && msg.type() === "error"); // firefox on playwright doesn't properly display the error text. Ignoring these for now
        if (!isExcluded) {
            unexpectedConsoleMessages.push(msg);
        }
    });

    await use(consoleMessages);

    const unexpectedConsoleMessagesDtos = unexpectedConsoleMessages.map(msg => {
        return {
            type: msg.type(),
            text: msg.text(),
            location: msg.location(),
        };
    });
    expect(unexpectedConsoleMessagesDtos).toEqual([]);
}
