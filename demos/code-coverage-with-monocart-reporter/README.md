# Playwright code coverage with monocart-reporter

- [Description](#description)
- [How to build, run the app and run tests](#how-to-build-run-the-app-and-run-tests)
- [How to view the test results and code coverage](#how-to-view-the-test-results-and-code-coverage)
- [Tests and code coverage](#tests-and-code-coverage)
  - [Playwright configuration](#playwright-configuration)
  - [monocart-reporter configuration](#monocart-reporter-configuration)
  - [Collect code coverage](#collect-code-coverage)
  - [Learn more](#learn-more)
- [JS, CSS and HTML code coverage](#js-css-and-html-code-coverage)

## Description

The demo at [/demos/code-coverage-with-monocart-reporter](/demos/code-coverage-with-monocart-reporter/) shows how to get code coverage with Playwright by using the [monocart-reporter](https://www.npmjs.com/package/monocart-reporter) npm package.

> [!NOTE]
>
> As of writing this, there's an [open GitHub issue](https://github.com/microsoft/playwright/issues/7030) about improving the built-in code coverage support for Playwright. Also check out [this comment](https://github.com/microsoft/playwright/issues/7030#issuecomment-1575606073) on that issue.
>
> Thank you [@mxschmitt](https://github.com/mxschmitt) !

## How to build, run the app and run tests

> [!IMPORTANT]
>
> Required dependencies:
>
> - [Node](https://nodejs.org/en/blog/release/v20.10.0). Tested working with `v20.10.0`. If you need to have different versions of node installed it's recommended that you use [Node Version Manager](https://github.com/nvm-sh/nvm) to install and swap between node versions.
> - [npm@latest](https://www.npmjs.com/package/npm): package manager used on the demos. Tested working on `10.2.5`.
> - [VS Code](https://code.visualstudio.com/download) is recommended as a code editor but you can use whatever you prefer.

1. Clone the repo.
2. Using your favorite shell go to `/demos/code-coverage-with-monocart-reporter`.
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
   This will start the app and run the [playwright tests](/demos/code-coverage-with-monocart-reporter/tests/example.spec.ts) against it.
6. If you just want to run the app execute the command:
   ```
   npm start
   ```
   Once the command finishes the app should open in your default browser at [http://127.0.0.1:4200/](http://127.0.0.1:4200/).

## How to view the test results and code coverage

After running the tests with `npm test` you can view test results with:

```
npm run test:show-report
```

After opening the test results report you can view the code coverage by opening the menu on the top right and then find the `Coverage Report - playwright code coverage demo with monocart reporter` option under `artifacts`.

https://github.com/edumserrano/playwright-adventures/assets/15857357/cacb8c83-1fc2-41e6-9c1c-f6a696536476

Alternatively, you can view the code coverage report with:

```
npm run coverage:show-report
```

## Tests and code coverage

Once you've installed the `monocart-reporter` NPM package with `npm i -D monocart-reporter`, there are two main building blocks to configure code coverage:

- on the `playwright.config.ts`, use the `monocart-reporter` as one of the reporters in the `reporter` array.
- use playwright's [code coverage API](https://playwright.dev/docs/api/class-coverage) to collect code coverage during the tests' execution.

### Playwright configuration

The majority of the content of the [playwright.config.ts](/demos/code-coverage-with-monocart-reporter/playwright.config.ts) file is what you get by default after [adding Playwright to your project](https://playwright.dev/docs/intro#installing-playwright) with `npm init playwright@latest`.

The main changes are:

1. Declared a few variables at the start that are reused throughout the playwright configuration.
2. Updated the `reporter` array. Instead of using the [default html reporter](https://playwright.dev/docs/test-reporters#html-reporter), use the [built-in list reporter](https://playwright.dev/docs/test-reporters#list-reporter) and the [third-party monocart-reporter](https://playwright.dev/docs/test-reporters#third-party-reporter-showcase).
3. Defined a [baseURL](https://playwright.dev/docs/test-webserver#adding-a-baseurl) so that we can use relative URLs when doing page navigations on the tests.
4. Configured the `webServer` block to run the Angular app locally so that the tests can be executed against it. If you're not testing an Angular app that's fine, you just need to adjust the `webServer.command` so that it launches your app and set the `webServer.url` to the url your app will be running at. For more information see the [webServer docs](https://playwright.dev/docs/test-webserver).

> [!NOTE]
>
> The `_isRunningOnCI` variable used on the `playwright.config.ts` changes the value of some options when tests running on CI. To set the `_isRunningOnCI` variable to `true` you must set the environment variable `CI` to `true` before running the tests. For more information regarding using Playwright on a CI environment see [Playwright docs on Continuous Integration](https://playwright.dev/docs/ci).

Furthermore, we have created:

- a [playwright.monocart-reporter.ts](/demos/code-coverage-with-monocart-reporter/playwright.monocart-reporter.ts) file: where we define the `monocart-reporter` configuration.
- a [playwright.cli-options.ts](/demos/code-coverage-with-monocart-reporter/playwright.cli-options.ts) file: to represent Playwright CLI options we care about.
- a [playwright.env-vars.ts](/demos/code-coverage-with-monocart-reporter/playwright.env-vars.ts) file: to represent environment variables we care about.

> [!NOTE]
>
> You don't have to create the `playwright.monocart-reporter.ts`, the `playwright.cli-options.ts` or the `playwright.env-vars.ts` file. You can have all of this on the `playwright.config.ts`. Code structure is up to you.

> [!NOTE]
>
> Depending on your `playwright.config.ts`, make sure you update your `.gitignore` to exclude any directory used by test results, report results, etc. Scroll to the end of this demo's [.gitignore](/demos/code-coverage-with-monocart-reporter/.gitignore) to see an example.

### monocart-reporter configuration

The `monocart-reporter` configuration is done at [playwright.monocart-reporter.ts](/demos/code-coverage-with-monocart-reporter/playwright.monocart-reporter.ts). The `monocart-reporter` has a `coverage` option which let's you configure the options for the code coverage reports. The configuration at [playwright.monocart-reporter.ts](/demos/code-coverage-with-monocart-reporter/playwright.monocart-reporter.ts) will create:

- an **html report** with monocart style: this is my prefered html report.
- an **lcov report**: which is useful to upload to some tools like [SonarQube](https://www.sonarsource.com/products/sonarqube/), etc.
- a **covertura report**: which is useful to upload to some tools like [Azure DevOps](https://azure.microsoft.com/en-us/products/devops), [CodeCov](https://about.codecov.io/), etc.
- an **html report** with the [istanbul](https://github.com/istanbuljs/nyc) `html-spa` style: this is not really necessary. We already have the monocart html report but it's here just to demo that you can have multiple html reports if you want.

The produced folder structure after running the tests looks like this:

```
tests/
└── test-results/
    ├── monocart-report.html
    ├── monocart-report.json
    └── code-coverage/
        ├── cobertura/
        │   └── code-coverage.cobertura.xml
        ├── html-spa/
        │   ├── index.html
        │   └── ...(several other files required for the html report)
        ├── lcov/
        │   └── code-coverage.lcov.info
        └── v8/
            └── index.html
```

### Collect code coverage

> [!IMPORTANT]
>
> Playwright's Coverage APIs are only supported on Chromium-based browsers.

To collect the code coverage we use playwright's [code coverage API](https://playwright.dev/docs/api/class-coverage). You could add these code coverage API calls to all your tests or you can use [Playwright fixtures](https://playwright.dev/docs/test-fixtures) to code them once and reuse across tests.

The approach taken in this demo was to create an [automatic fixture](https://playwright.dev/docs/test-fixtures#automatic-fixtures), named [codeCoverageAutoTestFixture](/demos/code-coverage-with-monocart-reporter//tests/_shared/app-fixtures.ts), so that the code coverage calls are automatically added to any test that is created without having to do anything extra as long as the `test` import comes from this fixture. See the [example.spec.ts](/demos/code-coverage-with-monocart-reporter/tests//example.spec.ts) and note the import statment at the top:

```ts
import { test, expect } from "tests/_shared/app-fixtures";
```

To use the `codeCoverageAutoTestFixture` automatic fixture all your tests should import the `test` from the fixture instead of doing the usual:

```ts
import { test, expect } from "@playwright/test";
```

To learn more about why this is done study how [fixtures work on Playwright](https://playwright.dev/docs/test-fixtures).

Note that the code coverage logic that the `codeCoverageAutoTestFixture` fixture uses is encapsulated in the [v8-code-coverage.ts](/demos/code-coverage-with-monocart-reporter/tests/_shared/fixtures/v8-code-coverage.ts) file. The fixture is capturing both `JS` and `CSS` code coverage but what to cover is your choice by setting the values of `enableJsCoverage` and `enableCssCoverage`.

Once the code coverage is collected, it's being added to the `monocart-reporter` by invoking the `addCoverageReport` function.

### Learn more

To learn more about configuring the monocart-reporter and code coverage see:

- [monocart-reporter README](https://github.com/cenfun/monocart-reporter)
- [Code Coverage Report section of the monocart-reporter README](https://github.com/cenfun/monocart-reporter#code-coverage-report)
- [monocart-reporter typings](https://github.com/cenfun/monocart-reporter/blob/main/lib/index.d.ts)
- [monocart-coverage-reports README](https://github.com/cenfun/monocart-coverage-reports): this repo is what provides the code coverage for the `monocart-reporter`.
- [monocart-coverage-reports typings](https://github.com/cenfun/monocart-coverage-reports/blob/main/lib/index.d.ts)

## JS, CSS and HTML code coverage

The V8 code coverage is capable of collecting code coverage not only fo JS but also for CSS and HTML. In the code coverage report for this demo you can see coverage shown for the the `TS` and `HTML` files.

You should also see code coverage for the [src/app/app.component.css](/demos/code-coverage-with-monocart-reporter/src/app/app.component.css) file but it isn't showing up for this Angular app due to this GitHub issue [microsoft/playwright [BUG] Missing CSS code coverage #28510](https://github.com/microsoft/playwright/issues/28510).
