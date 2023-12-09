# Playwright code coverage with monocart-reporter

- [Description](#description)
- [How to build, run the app and run tests](#how-to-build-run-the-app-and-run-tests)
- [The app](#the-app)
- [Tests and code coverage](#tests-and-code-coverage)
  - [Playwright configuration](#playwright-configuration)
  - [monocart-reporter configuration](#monocart-reporter-configuration)
  - [Collect code coverage](#collect-code-coverage)

## Description

The demo at [/demos/code-coverage-with-monocart-reporter](/demos/code-coverage-with-monocart-reporter/) shows how to get code coverage with Playwright by using the [monocart-reporter](https://www.npmjs.com/package/monocart-reporter) npm package.

## How to build, run the app and run tests

1) Clone the repo.
2) Using your favorite shell go to `/demos/code-coverage-with-monocart-reporter`.
3) Install the required npm packages with:
    ```
    npm install
    ```
4) Install the [playwright browsers](https://playwright.dev/docs/browsers) with:
    ```
    npx playwright install
    ```
5) Run the tests with:
    ```
    npm test
    ```
    This will start the app and run the [playwright tests](/demos/code-coverage-with-monocart-reporter/tests/example.spec.ts) against it.
6) If you just want to run the app execute the command:
    ```
    npm start
    ```
    Once the command finishes the app should open in your default browser at [http://127.0.0.1:4200/](http://127.0.0.1:4200/).

## The app

The app being tested is an Angular 17 app. It has very little changes from the template you get from doing `ng new`. The only addition is a button which has some conditional logic to better show the code coverage.

> [!NOTE]
>
> Although the app being tested is an Angular app, the Playwright concepts that are demoed are frontend framework agnostic which means they and can be applied to any frontend framework.
>

## Tests and code coverage

To get code coverage with `monocart-reporter` there are two main building blocks:

- on the `playwright.config.ts`, use the `monocart-reporter` as one of the reporters in the `reporter` array.
- use playwright's [code coverage API](https://playwright.dev/docs/api/class-coverage) to collect code coverage during the tests' execution.

### Playwright configuration

The majority of the content of the [playwright.config.ts](/demos/code-coverage-with-monocart-reporter/playwright.config.ts) file is what you get by default after [adding Playwright to your project](https://playwright.dev/docs/intro#installing-playwright) with `npm init playwright@latest`.

The main changes are:

1) Declared a few variables at the start that are reused throught the playwright configuration.
2) Updated the `reporter` array. Instead of using the [default html reporter](https://playwright.dev/docs/test-reporters#html-reporter), use the [built-in list reporter](https://playwright.dev/docs/test-reporters#list-reporter) and the [third-party monocart-reporter](https://playwright.dev/docs/test-reporters#third-party-reporter-showcase). 
3) Configured the `webServer` block to run the Angular app locally so that the tests can be executed against it. If you're not testing an Angular app that's fine, you just need to adjust the `webServer.command` so that it launches your app and set the `webServer.url` to the url your app will be running at. For more information see the [webServer docs](https://playwright.dev/docs/test-webserver).

### monocart-reporter configuration

The `monocart-reporter` configuration is done at [playwright.monocart-reporter.ts](/demos/code-coverage-with-monocart-reporter/playwright.monocart-reporter.ts). This separation is not necessary though, you can have everything declared in the `playwright.config.ts`. Code structure is up to you.

The `monocart-reporter` has a `coverage` option which let's you configure the options for the code coverage reports.

The configuration at [playwright.monocart-reporter.ts](/demos/code-coverage-with-monocart-reporter/playwright.monocart-reporter.ts) will create:
- an html report with monocart style: this is my prefered html report. 
- an lcov report: which is useful to upload to some tools like [SonarQube](https://www.sonarsource.com/products/sonarqube/), etc.
- a covertura report: which is useful to upload to some tools like [Azure DevOps](https://azure.microsoft.com/en-us/products/devops), [CodeCov](https://about.codecov.io/), etc.
- an html report with the [istanbul](https://github.com/istanbuljs/nyc) `html-spa` style: this is not really necessary. We already have the monocart html report but it's here just to demo that you can have multiple html reports if you want.

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

To learn more about configuring the monocart-reporter and code coverage see:

- [monocart-reporter README](https://github.com/cenfun/monocart-reporter)
- [Code Coverage Report section of the monocart-reporter README](https://github.com/cenfun/monocart-reporter#code-coverage-report)
- [monocart-reporter typings](https://github.com/cenfun/monocart-reporter/blob/main/lib/index.d.ts)
- [monocart-coverage-reports README](https://github.com/cenfun/monocart-coverage-reports): this repo is what provides the code coverage for the `monocart-reporter`.
- [monocart-coverage-reports typings](https://github.com/cenfun/monocart-coverage-reports/blob/main/lib/index.d.ts)

### Collect code coverage

> [!IMPORTANT]  
>
> Playwright's Coverage APIs are only supported on Chromium-based browsers.
>

To collect the code coverage we use playwright's [code coverage API](https://playwright.dev/docs/api/class-coverage). You could add these code coverage API calls to all your tests or you can use [Playwright fixtures](https://playwright.dev/docs/test-fixtures) to code them once and reuse across tests.

The approach taken in this demo was to create an [automatic fixture](https://playwright.dev/docs/test-fixtures#automatic-fixtures) so that the code coverage calls are automatically added to any test that is created without having to do anything extra as long as the `test` import comes from the `export` done on the fixture. See the [example.spec.ts](/demos/code-coverage-with-monocart-reporter/tests//example.spec.ts) and note the import statment at the top:

```ts
import { test, expect } from 'tests/_shared/app-fixtures';
```

To use the automatic fixture all your tests should import the `test` from the fixture instead of doing the usual:

```ts
import { test, expect } from '@playwright/test';
```

To learn more about why this is done study how [fixtures work on Playwright](https://playwright.dev/docs/test-fixtures).

You can see the `codeCoverageAutoTestFixture` automatic fixture code at [app-fixtures.ts](/demos/code-coverage-with-monocart-reporter/tests/_shared/app-fixtures.ts). Note that the code coverage logic that the fixture uses is encapsulated in the [v8-code-coverage.ts](/demos/code-coverage-with-monocart-reporter/tests/_shared/fixtures/v8-code-coverage.ts) file.

The fixture is capturing both `JS` and `CSS` code coverage but what to cover is your choice by setting the values of `enableJsCoverage` and `enableCssCoverage`.

Once the code coverage is collected, it's being added to the `monocart-reporter` by invoking the `addCoverageReport` function. 

> [!NOTE]
>
> If you didn't want to use the `monocart-reporter` to generate the code coverage reports from the collected [v8 code coverage](https://medium.com/@kuldeepkeshwar/code-coverage-directly-from-v8-3a4e86c2cdba), you could use other libraries to process the data or save it to files for later processing.
