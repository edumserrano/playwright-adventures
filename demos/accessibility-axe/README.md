# Accessibility using @axe-core/playwright

- [Description](#description)
- [How to build, run the app, run tests and view the test results](#how-to-build-run-the-app-run-tests-and-view-the-test-results)
- [Playwright configuration](#playwright-configuration)
- [Accessibility testing](#accessibility-testing)

## Description

The demo at [/demos/accessibility-axe](/demos/accessibility-axe/) shows how to use Playwright to test your application for many types of accessibility issues.

## How to build, run the app, run tests and view the test results

> [!IMPORTANT]
>
> Required dependencies:
>
> - [Node](https://nodejs.org/en/blog/release/v20.10.0). Tested working with `v20.10.0`. If you need to have different versions of node installed it's recommended that you use [Node Version Manager](https://github.com/nvm-sh/nvm) to install and swap between node versions.
> - [npm@latest](https://www.npmjs.com/package/npm): package manager used on the demos. Tested working on `10.2.5`.
> - [VS Code](https://code.visualstudio.com/download) is recommended as a code editor but you can use whatever you prefer.

1. Clone the repo.
2. Using your favorite shell go to `/demos/accessibility-axe`.
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
   This will start the app and run the [playwright tests](/demos/accessibility-axe/tests/example.spec.ts) against it.
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
> When you run the tests in this demo with `npm test` you will have 3 tests that pass and 3 that fail. This is intentional. The app being tested does have accessability issues and this demo shows how to write a test that captures them as well as how to write tests to exclude certain accessibility rules. For more information see the comments at [example.spec.ts](./tests/example.spec.ts).

The accessibility scan report can be found attached to the tests.

https://github.com/edumserrano/playwright-adventures/assets/15857357/f6ca2268-e85e-4764-b582-e33949c36780

## Playwright configuration

The majority of the content of the [playwright.config.ts](/demos/accessibility-axe/playwright.config.ts) file is what you get by default after [adding Playwright to your project](https://playwright.dev/docs/intro#installing-playwright) with `npm init playwright@latest`.

The main changes are:

1. Declared a few variables at the start that are reused throughout the playwright configuration.
2. Updated the `reporter` array. In addition to using the [default html reporter](https://playwright.dev/docs/test-reporters#html-reporter), we've added the [built-in list reporter](https://playwright.dev/docs/test-reporters#list-reporter).
3. Defined a [baseURL](https://playwright.dev/docs/test-webserver#adding-a-baseurl) so that we can use relative URLs when doing page navigations on the tests.
4. Configured the `webServer` block to run the Angular app locally so that the tests can be executed against it. If you're not testing an Angular app that's fine, you just need to adjust the `webServer.command` so that it launches your app and set the `webServer.url` to the url your app will be running at. For more information see the [webServer docs](https://playwright.dev/docs/test-webserver).

> [!NOTE]
>
> The `_isRunningOnCI` variable used on the `playwright.config.ts` changes the value of some options when running tests on CI. To set the `_isRunningOnCI` variable to `true` you must set the environment variable `CI` to `true` before running the tests. For more information regarding using Playwright on a CI environment see [Playwright docs on Continuous Integration](https://playwright.dev/docs/ci).

Furthermore, we have created:

- a [playwright.cli-options.ts](/demos/accessibility-axe/playwright.cli-options.ts) file: to represent Playwright CLI options we care about.
- a [playwright.env-vars.ts](/demos/accessibility-axe/playwright.env-vars.ts) file: to represent environment variables we care about.

> [!NOTE]
>
> You don't have to create the `playwright.cli-options.ts` or the `playwright.env-vars.ts` file. You can have all of this on the `playwright.config.ts`. Code structure is up to you.

> [!NOTE]
>
> Depending on your `playwright.config.ts`, make sure you update your `.gitignore` to exclude any directory used by test results, report results, etc. Scroll to the end of this demo's [.gitignore](/demos/accessibility-axe/.gitignore) to see an example.

## Accessibility testing

This demo is the recommended approach to doing accessibility testing with Playwright. It relies on the [@axe-core/playwright](https://www.npmjs.com/package/@axe-core/playwright) package which adds support for running the [axe accessibility testing engine](https://www.deque.com/axe/) as part of your Playwright tests. For more information see Playwright documentation on [accessibility testing](https://playwright.dev/docs/accessibility-testing).

For another approach to accessibility testing with Playwright see the [accessibility-lighthouse demo](/demos/accessibility-lighthouse/) which uses the Chrome only [lighthouse](https://www.npmjs.com/package/lighthouse) library.
