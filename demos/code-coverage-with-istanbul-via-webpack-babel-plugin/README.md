# Playwright code coverage with Istanbul via Webpack Babel plugin

- [Description](#description)
- [How to build, run the app and run tests](#how-to-build-run-the-app-and-run-tests)
- [How to view the test results and code coverage](#how-to-view-the-test-results-and-code-coverage)
- [The app](#the-app)
- [Tests and code coverage](#tests-and-code-coverage)
  - [Playwright configuration](#playwright-configuration)
  - [Collect code coverage data](#collect-code-coverage-data)
  - [Generate code coverage reports](#generate-code-coverage-reports)
  - [Learn more](#learn-more)
- [JS, CSS and HTML code coverage](#js-css-and-html-code-coverage)

## Description

The demo at [/demos/code-coverage-with-istanbul-via-webpack-babel-plugin](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/) shows how to get code coverage with Playwright by using [Istanbul](https://istanbul.js.org/) to instrument the code.

We can use the [babel-plugin-istanbul](https://github.com/istanbuljs/babel-plugin-istanbul) Webpack plugin to instrument the code with `Istanbul`. The instrumented code will automatically generate coverage data and save it on `window.__coverage__`. 

Then this demo saves the code coverage data into files so that after we can generate code coverage reports using the [nyc](https://github.com/istanbuljs/nyc) CLI tool.

> [!NOTE]
> 
> This solution was implemented based on the work done by [@mxschmitt](https://github.com/mxschmitt) who, at the moment of writing this, is part of the Playwright dev team. See his work at https://github.com/mxschmitt/playwright-test-coverage
>
> Thank you [@mxschmitt](https://github.com/mxschmitt) !
> 

## How to build, run the app and run tests

1) Clone the repo.
2) Using your favorite shell go to `/demos/code-coverage-with-istanbul-via-webpack-babel-plugin`.
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
    This will start the app and run the [playwright tests](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/tests/example.spec.ts) against it.
6) If you just want to run the app execute the command:
    ```
    npm start
    ```
    Once the command finishes the app should open in your default browser at [http://127.0.0.1:4200/](http://127.0.0.1:4200/).

## How to view the test results and code coverage

**After running the tests** with `npm test` you can view the test results with:

```
npm run test:show-report
```

You can generate the code coverage reports with:
```
npm run coverage:report
```

And you can view the code coverage html report with:
```
npm run coverage:show-report
```

## The app

The app being tested is an Angular 17 app. It has very little changes from the template you get from doing `ng new`. The only addition is a button which has some conditional logic to better show the code coverage.

> [!NOTE]
>
> Although the app being tested is an Angular app, the Playwright concepts that are demoed are frontend framework agnostic which means they and can be applied to any frontend framework.
>

## Tests and code coverage

To get code coverage with `Istanbul` there are two main building blocks:

- use the `babel-plugin-istanbul` Webpack plugin to collect code coverage during the tests' execution.
- use the `nyc` CLI tool to generate the code coverage reports from the code coverage data.

### Playwright configuration 

The majority of the content of the [playwright.config.ts](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/playwright.config.ts) file is what you get by default after [adding Playwright to your project](https://playwright.dev/docs/intro#installing-playwright) with `npm init playwright@latest`.

The main changes are:

1) Declared a few variables at the start that are reused throught the playwright configuration.
2) Updated the `reporter` array. Added the [built-in list reporter](https://playwright.dev/docs/test-reporters#list-reporter) to the [default html reporter](https://playwright.dev/docs/test-reporters#html-reporter), .
3) Configured the `webServer` block to run the Angular app locally so that the tests can be executed against it. If you're not testing an Angular app that's fine, you just need to adjust the `webServer.command` so that it launches your app and set the `webServer.url` to the url your app will be running at. For more information see the [webServer docs](https://playwright.dev/docs/test-webserver).

> [!NOTE]
> 
> The `_isRunningOnCI` variable used on the `playwright.config.ts` changes the value of some options when running tests on CI. To set the `_isRunningOnCI` variable to `true` you must set the environment variable `CI` to `true` before running the tests. For more information regarding using Playwright on a CI environment see [Playwright docs on Continuous Integration](https://playwright.dev/docs/ci). 
>

Furthermore, we have created the [playwright.shared-vars.js](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/playwright.shared-vars.js) file because some of the test filepaths are shared between the playwright configuration, [code to save the Istanbul code coverage instrumentation](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/tests/_shared/coverage.webpack.js) and the [configuration for creating the code coverage reports](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/nyc.config.js) with `nyc`. 

> [!NOTE]
>
> You don't have to create a `playwright.shared-vars.js` file. I did it so I didn't have to repeat these variables in several places.
>

> [!NOTE]
> 
> Depending on your `playwright.config.ts`, make sure you update your `.gitignore` to exclude any directory used by test results, report results, etc. Scroll to the end of this demo's [.gitignore](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/.gitignore) to see an example.
> 
### Collect code coverage data

To instrument the code whilst the tests are running we used the `babel-plugin-istanbul` Webpack plugin. To use this plugin we have to extend Angular's Webpack configuration and this demo uses the [@angular-builders/custom-webpack](https://www.npmjs.com/package/@angular-builders/custom-webpack) npm package to do that.

By using the `@angular-builders/custom-webpack` package we can then update the [angular.json](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/angular.json) to indicate that we have an extra Webpack configuration file we want to be executed. See the `customWebpackConfig` option in the `angular.json` file.

We set the `customWebpackConfig` to the [coverage.webpack.js](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/tests/_shared/coverage.webpack.js) file which adds the `babel-plugin-istanbul` to the Webpack's blunding process.

> [!NOTE]
> 
> This code demo uses an Angular 17 app but the concept is still valid for any other frontend framework. What you have to do is extend your blunding process to enable capturing code coverage data and different frontend frameworks will have different ways to allow you to do this.
> 
> Furthermore, for those using Angular, this is an Angular 17 app but it's not using the new Angular esbuilder, it's still using Webpack. The reason is that I don't know how to extend the bundling process of an Angular 17 app using esbuild, perhaps I'll give a try again when this GitHub issue [just-jeb/angular-builders Support Customization of new application builder #1537](https://github.com/just-jeb/angular-builders/issues/1537) and PR [just-jeb/angular-builders feat(custom-esbuild): allow providing ESBuild plugins #1536](https://github.com/just-jeb/angular-builders/pull/1536) are complete.
> 

Now, when the app is running in development mode we will have `Istanbul` instrumenting the code and saving the coverage data on a `window` variable, the  `window.__coverage__`. 

With the code instrumentation in place, the last part we need to do is to save the collected code coverage data so that later we can generate the code coverage reports. This is done by the [istanbul-code-coverage.ts](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/tests/_shared/fixtures/istanbul-code-coverage.ts) file. The `istanbul-code-coverage.ts` is invoked from a Playwright [automatic fixture](https://playwright.dev/docs/test-fixtures#automatic-fixtures). [Playwright fixtures](https://playwright.dev/docs/test-fixtures) allow us to easily reuse logic across tests.

The automatic fixture is implemented at [app-fixtures.ts](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/tests/_shared/app-fixtures.ts).

With this automatic fixture in place, the code coverage data is saved to files for any test without having to do anything extra as long as the `test` import comes from this fixture. See the [example.spec.ts](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/tests//example.spec.ts) and note the import statment at the top:

```ts
import { test, expect } from 'tests/_shared/app-fixtures';
```

To use the automatic fixture all your tests should import the `test` from the fixture instead of doing the usual:

```ts
import { test, expect } from '@playwright/test';
```

To learn more about why this is done study how [fixtures work on Playwright](https://playwright.dev/docs/test-fixtures).

With all of the above in place, after you execute `npm test` you will see the collected code coverage data saved into the `tests/test-results/code-coverage/istanbul-instrumentation` folder.

### Generate code coverage reports

After running `npm test` to run the tests and generate the code coverage data, you can run the `npm run coverage:report` command which will use `nyc` CLI tool to create the code coverage reports.

The `nyc` configuration file [nyc.config.js](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/nyc.config.js) will create:
- an **html report** with the [istanbul](https://github.com/istanbuljs/nyc) `html-spa` style. This is a human readable code coverage report.
- an **lcov report**: which is useful to upload to some tools like [SonarQube](https://www.sonarsource.com/products/sonarqube/), etc.
- a **covertura report**: which is useful to upload to some tools like [Azure DevOps](https://azure.microsoft.com/en-us/products/devops), [CodeCov](https://about.codecov.io/), etc.
- a **text-summary report**: which is useful summary output that you get on the console after running the command to generate code coverage.

The produced folder structure after running command to generate code coverage looks like this:

```
tests/
└── test-results/
    └── code-coverage/
        ├── istanbul-instrumentation/
        │   └── ... (coverage data from running the tests)
        └── reports/
            ├── index.html (entry point to the html report)
            ├── cobertura-coverage.xml
            ├── lcov.info
            └── ... (other files to support the html report)
```

> [!CAUTION]
>
> When I added the `text-summary` reporter to the `nyc.config.js` I added it as the first element of the `reporter` array. This however had unintended consequences because it somehow affected the output produced by the `html-spa` reporter making it invalid. Moving the `text-summary` to the last element of the `reporter` array seems to fix this quirk.
> 

### Learn more

To learn more about `Istanbul` and configuring the `nyc` reporter see:

- [istanbuljs repo](https://github.com/istanbuljs/istanbuljs)
- [babel-plugin-istanbul repo](https://github.com/istanbuljs/babel-plugin-istanbul)
- [nyc repo](https://github.com/istanbuljs/nyc)
- [istanbuljs website](https://istanbul.js.org/)
- [Using Alternative Reporters](https://istanbul.js.org/docs/advanced/alternative-reporters/)
- [@istanbuljs/nyc-config-typescript npm package](https://www.npmjs.com/package/@istanbuljs/nyc-config-typescript)

## JS, CSS and HTML code coverage

Unlike the [demo](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/README.md) that uses V8 to get code coverage, this demo is only capable of collecting JS code coverage, it won't provide CSS or HTML coverage.
