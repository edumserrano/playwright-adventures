# Accessibility using lighthouse

- [Description](#description)
- [How to build, run the app, run tests and view the test results](#how-to-build-run-the-app-run-tests-and-view-the-test-results)
- [Playwright configuration](#playwright-configuration)
- [Accessibility testing](#accessibility-testing)
  - [The lighthouse-audit.ts file](#the-lighthouse-auditts-file)
  - [The lighthouse-fixtures.ts file](#the-lighthouse-fixturests-file)
  - [The test](#the-test)

## Description

The demo at [/demos/accessibility-lighthouse](/demos/accessibility-lighthouse/) shows how to use Playwright to test your application for many types of accessibility issues.

## How to build, run the app, run tests and view the test results

> [!IMPORTANT]
>
> Required dependencies:
>
> - [Node](https://nodejs.org/en/blog/release/v20.10.0). Tested working with `v20.10.0`. If you need to have different versions of node installed it's recommended that you use [Node Version Manager](https://github.com/nvm-sh/nvm) to install and swap between node versions.
> - [npm@latest](https://www.npmjs.com/package/npm): package manager used on the demos. Tested working on `10.2.5`.
> - [VS Code](https://code.visualstudio.com/download) is recommended as a code editor but you can use whatever you prefer.

1. Clone the repo.
2. Using your favorite shell go to `/demos/accessibility-lighthouse`.
3. Install the required npm packages with:
   ```
   npm install
   ```
4. Install the [playwright browsers](https://playwright.dev/docs/browsers) with:
   ```
   npx playwright install
   ```
5. Run the tests with:
   ```
   npm test
   ```
   This will start the app and run the [playwright tests](/demos/accessibility-lighthouse/tests/lighthouse.spec.ts) against it.
6. After running the tests you can view test results with:
   ```
   npm run test:show-report
   ```
7. If you just want to run the app execute the command:
   ```
   npm start
   ```
   Once the command finishes the app should open in your default browser at [http://127.0.0.1:4200/](http://127.0.0.1:4200/).

> [!NOTE]
>
> When you run the tests in this demo with `npm test` you will have 1 test that passes and 2 that are skipped. This is to show that `Lighthouse` will only run on `Chromium` browsers.
>

The `Lighthouse` run report can be found attached to the test:

## Playwright configuration

The majority of the content of the [playwright.config.ts](/demos/accessibility-lighthouse/playwright.config.ts) file is what you get by default after [adding Playwright to your project](https://playwright.dev/docs/intro#installing-playwright) with `npm init playwright@latest`.

The main changes are:

1. Declared a few variables at the start that are reused throughout the playwright configuration.
2. Updated the `reporter` array. Replaced the [built-in html reporter](https://playwright.dev/docs/test-reporters#html-reporter) by the [monocart-reporter](https://www.npmjs.com/package/monocart-reporter) and added the [built-in list reporter](https://playwright.dev/docs/test-reporters#list-reporter).
3. Defined a [baseURL](https://playwright.dev/docs/test-webserver#adding-a-baseurl) so that we can use relative URLs when doing page navigations on the tests.
4. Configured the `webServer` block to run the Angular app locally so that the tests can be executed against it. If you're not testing an Angular app that's fine, you just need to adjust the `webServer.command` so that it launches your app and set the `webServer.url` to the url your app will be running at. For more information see the [webServer docs](https://playwright.dev/docs/test-webserver).

> [!NOTE]
>
> The `_isRunningOnCI` variable used on the `playwright.config.ts` changes the value of some options when running tests on CI. To set the `_isRunningOnCI` variable to `true` you must set the environment variable `CI` to `true` before running the tests. For more information regarding using Playwright on a CI environment see [Playwright docs on Continuous Integration](https://playwright.dev/docs/ci).

Furthermore, we have created:

- a [playwright.cli-options.ts](/demos/accessibility-lighthouse/playwright.cli-options.ts) file: to represent Playwright CLI options we care about.
- a [playwright.env-vars.ts](/demos/accessibility-lighthouse/playwright.env-vars.ts) file: to represent environment variables we care about.

> [!NOTE]
>
> You don't have to create the `playwright.cli-options.ts` or the `playwright.env-vars.ts` file. You can have all of this on the `playwright.config.ts`. Code structure is up to you.

> [!NOTE]
>
> Depending on your `playwright.config.ts`, make sure you update your `.gitignore` to exclude any directory used by test results, report results, etc. Scroll to the end of this demo's [.gitignore](/demos/accessibility-lighthouse/.gitignore) to see an example.

## Accessibility testing

This demo uses the [lighthouse](https://www.npmjs.com/package/lighthouse) NPM package. The recommended approach to doing accessibility testing with Playwright is to use the [@axe-core/playwright](https://www.npmjs.com/package/@axe-core/playwright) package for which you can find a demo at [/demos/accessibility-axe/](/demos/accessibility-axe/).

Using `Lighthouse` has the following limitations:

- Only works for running tests against Chrome based browsers.
- Doesn't have any interaction with Playwright constructs such as `Page`, `Browser`, etc. This limitation is further explained in [The lighthouse-audit.ts file](#the-lighthouse-auditts-file) section below.

The [test](/demos/accessibility-lighthouse/tests/lighthouse.spec.ts) in this demo integrates with `Lighthouse` with the assistance of:

- [lighthouse-audit.ts](/demos/accessibility-lighthouse/tests/lighthouse-audit.ts): contains a helper function named `lighthouseAuditAsync` which configures and runs `Lighthouse`.
- [lighthouse-fixtures.ts](/demos/accessibility-lighthouse/tests/lighthouse-fixtures.ts): which sets up some fixtures required to run `Lighthouse`.

### The lighthouse-audit.ts file

The [lighthouse-audit.ts](/demos/accessibility-lighthouse/tests/lighthouse-audit.ts) exports the `lighthouseAuditAsync` function which takes in a `LighthouseAuditOptions` object with:

- `remoteDebuggingPort`: the debugging port used by `Lighthouse` to connect to the Chrome browser instance started by Playwright.
- `url`: which URL `Lighthouse` will navigate to before analyzing the page.
- `viewportWidth` and `viewportHeight`: a viewport size which `Lighthouse` will use when navigating to the page.

> [!CAUTION]
>
> `Lighthouse` is in charge of doing the page navigation and that is a limitation because it means we can't use interactions from Playwright constructs such as `await page.goto("/");` and then pass the `page` object to `Lighthouse`. The biggest problem with this is that it that you can't run `Lighthouse` against anything else other than the initial render state of a URL.
>
> If you need to navigate to a URL and perform some operations to set up the page in some state before you run `Lighthouse`, then you're out of luck. This is not possible. If you want to do this, use the [@axe-core/playwright](https://www.npmjs.com/package/@axe-core/playwright) NPM package instead, for which you can find a demo at [/demos/accessibility-axe/](/demos/accessibility-axe/)
>

The `lighthouseAuditAsync` function creates a `Config` object which contains the configuration used when running `Lighthouse`. There are many configuration values you can set. For more information you can go through the [Lighthouse docs](https://github.com/GoogleChrome/lighthouse/tree/main/docs) files such as:

- [Using programmatically](https://github.com/GoogleChrome/lighthouse/tree/main/docs#using-programmatically)
- [Lighthouse Configuration](https://github.com/GoogleChrome/lighthouse/blob/main/docs/configuration.md)
- [Network Throttling](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md)
- [Emulation in Lighthouse](https://github.com/GoogleChrome/lighthouse/blob/main/docs/emulation.md)

Lastly, the `lighthouseAuditAsync` method returns a `LighthouseResult` object which contains:

- `runnerResult`: the analysis executed by `Lighthouse`. This can be used to upload the `Lighthouse` report to the test.
- `categoriesResult`: percentage score, from 0 to 100, for each of the categories tested by `Lighthouse`. This can be used to do assertions in your test.

### The lighthouse-fixtures.ts file

The [lighthouse-fixtures.ts](/demos/accessibility-lighthouse/tests/lighthouse-fixtures.ts) defines a set of [Playwright fixtures](https://playwright.dev/docs/test-fixtures#introduction) that are required and also facilitate running `Lighthouse` with Playwright:

- `browser`: [overrides the built-in browser fixture](https://playwright.dev/docs/test-fixtures#overriding-fixtures) so that any `Lighthouse` test that uses the `browser` fixture will only run if the browser is `Chromium`, otherwise the test is marked as skipped. Furthermore, when the browser is `Chromium`, it sets the `--remote-debugging-port` arg for `Chromium` which `Lighthouse` requires. For more info see `port` in [Differences from CLI flags](https://github.com/GoogleChrome/lighthouse/tree/main/docs#differences-from-cli-flags).
- `remoteDebuggingPort`: this [worker fixture](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures) makes sure that the `--remote-debugging-port` is unique per Playwright test worker. If we try to launch different `Chrome` instances with the same `--remote-debugging-port` the tests will fail.
- `autoBrowser`: this [automatic fixture](https://playwright.dev/docs/test-fixtures#automatic-fixtures) makes it so that for every `Lighthouse` test the `browser` fixture is initialized which means a `Chromium` browser instance with the required `--remote-debugging-port` is available.

### The test

The test at [lighthouse.spec.ts](/demos/accessibility-lighthouse/tests/lighthouse.spec.ts) is very simple and consists on invoking the `lighthouseAuditAsync` function from [lighthouse-audit.ts](/demos/accessibility-lighthouse/tests/lighthouse-audit.ts) and then asserting on the the score of the `Lighthouse` categories.

In addition, the test also attaches the `Lighthouse` run results to the test report.

> [!WARNING]
>
> Attaching the `Lighthouse` run results to the test report only works because this demo is using the [monocart-reporter](https://www.npmjs.com/package/monocart-reporter). If you're using the default [built-in list reporter](https://playwright.dev/docs/test-reporters#list-reporter) then you will have to find another way to attach the `Lighthouse` run results.
>

For all the `Lighthouse` tests you need to have the:

```ts
import { expect, test } from "tests/lighthouse-fixtures";
```

So that the `test` function used is the one exported from [lighthouse-fixtures.ts](/demos/accessibility-lighthouse/tests/lighthouse-fixtures.ts), which is the one that extends the Playwright `test` function with the required fixtures for `Lighthouse`.

On other `non-Lighthouse` tests you should use the usual `test` import:

```ts
import { expect, test } from "@playwright/test"
```
