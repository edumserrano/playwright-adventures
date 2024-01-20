# monocart-reporter advanced configuration

- [Description](#description)
- [How to build, run the app, run tests and view the test results](#how-to-build-run-the-app-run-tests-and-view-the-test-results)
- [Playwright configuration](#playwright-configuration)
- [monocart-reporter configuration](#monocart-reporter-configuration)
  - [Add report metadata](#add-report-metadata)
  - [Customize the style of test tags](#customize-the-style-of-test-tags)
  - [Automatically collect test comments and add them to the test report](#automatically-collect-test-comments-and-add-them-to-the-test-report)

## Description

The demo at [/demos/monocart-reporter-advanced-config](/demos/monocart-reporter-advanced-config/) shows how to use some of the more advanced features of the HTML reporter [monocart-reporter](https://www.npmjs.com/package/monocart-reporter) NPM package such as:

- Add report metadata.
- Customize the style of test tags.
- Automatically collect test comments and add them to the test report.

For a full list of all the functionality supported by `monocart-reporter` check out it's docs at: [https://github.com/cenfun/monocart-reporter](https://github.com/cenfun/monocart-reporter).

## How to build, run the app, run tests and view the test results

> [!IMPORTANT]
>
> Required dependencies:
>
> - [Node](https://nodejs.org/en/blog/release/v20.10.0). Tested working with `v20.10.0`. If you need to have different versions of node installed it's recommended that you use [Node Version Manager](https://github.com/nvm-sh/nvm) to install and swap between node versions.
> - [npm@latest](https://www.npmjs.com/package/npm): package manager used on the demos. Tested working on `10.2.5`.
> - [VS Code](https://code.visualstudio.com/download) is recommended as a code editor but you can use whatever you prefer.

1. Clone the repo.
2. Using your favorite shell go to `/demos/monocart-reporter-advanced-config`.
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
   This will start the app and run the [playwright tests](/demos/monocart-reporter-advanced-config/tests/example.spec.ts) against it.
6. After running the tests you can view test results with:
   ```
   npm run test:show-report
   ```
7. If you just want to run the app execute the command:
   ```
   npm start
   ```
   Once the command finishes the app should open in your default browser at [http://127.0.0.1:4200/](http://127.0.0.1:4200/).

## Playwright configuration

The majority of the content of the [playwright.config.ts](/demos/monocart-reporter-advanced-config/playwright.config.ts) file is what you get by default after [adding Playwright to your project](https://playwright.dev/docs/intro#installing-playwright) with `npm init playwright@latest`.

The main changes are:

1. Declared a few variables at the start that are reused throughout the playwright configuration.
2. Updated the `reporter` array. Replaced the [built-in html reporter](https://playwright.dev/docs/test-reporters#html-reporter) by the [monocart-reporter](https://www.npmjs.com/package/monocart-reporter) and added the [built-in list reporter](https://playwright.dev/docs/test-reporters#list-reporter).
3. Defined a [baseURL](https://playwright.dev/docs/test-webserver#adding-a-baseurl) so that we can use relative URLs when doing page navigations on the tests.
4. Configured the `webServer` block to run the Angular app locally so that the tests can be executed against it. If you're not testing an Angular app that's fine, you just need to adjust the `webServer.command` so that it launches your app and set the `webServer.url` to the url your app will be running at. For more information see the [webServer docs](https://playwright.dev/docs/test-webserver).

> [!NOTE]
>
> The `_isRunningOnCI` variable used on the `playwright.config.ts` changes the value of some options when running tests on CI. To set the `_isRunningOnCI` variable to `true` you must set the environment variable `CI` to `true` before running the tests. For more information regarding using Playwright on a CI environment see [Playwright docs on Continuous Integration](https://playwright.dev/docs/ci).

Furthermore, we have created:

- a [playwright.cli-options.ts](/demos/monocart-reporter-advanced-config/playwright.cli-options.ts) file: to represent Playwright CLI options we care about.
- a [playwright.env-vars.ts](/demos/monocart-reporter-advanced-config/playwright.env-vars.ts) file: to represent environment variables we care about.
- a [playwright.global-setup.ts](/demos/monocart-reporter-advanced-config/playwright.global-setup.ts) file: contains the logic that is executed once before running all tests. See [Configure globalSetup and globalTeardown](https://playwright.dev/docs/test-global-setup-teardown#option-2-configure-globalsetup-and-globalteardown).
- a [playwright.monocart-reporter.ts](/demos/monocart-reporter-advanced-config/playwright.monocart-reporter.ts) file: contains the `monocart-reporter` configuration.

> [!NOTE]
>
> You don't have to create the `playwright.cli-options.ts`, the `playwright.env-vars.ts`, the `playwright.global-setup.ts` or the `playwright.monocart-reporter.ts` file. You can have all of this on the `playwright.config.ts`. Code structure is up to you.

> [!NOTE]
>
> Depending on your `playwright.config.ts`, make sure you update your `.gitignore` to exclude any directory used by test results, report results, etc. Scroll to the end of this demo's [.gitignore](/demos/monocart-reporter-advanced-config/.gitignore) to see an example.

## monocart-reporter configuration

The following sections details each of the advanced `monocart-reporter` configurations that you can see in this demo.

### Add report metadata

This example is based on the [Metadata](https://github.com/cenfun/monocart-reporter?tab=readme-ov-file#metadata) section of the `monocart-reporter` docs. This demo adds report metadata by:

- implementing the `globalSetup` function at [playwright.global-setup.ts](/demos/monocart-reporter-advanced-config/playwright.global-setup.ts). The logic in this file will add 11 pieces of metadata to the report including, Git information from the last commit to the repo at the time of running the tests.
- defining the `globalSetup` property in the [playwright.config.ts](/demos/monocart-reporter-advanced-config/playwright.config.ts) so that we can have logic executed once before running all tests. See [Configure globalSetup and globalTeardown](https://playwright.dev/docs/test-global-setup-teardown#option-2-configure-globalsetup-and-globalteardown). This property is set to execute the `globalSetup` function defined at [playwright.global-setup.ts](/demos/monocart-reporter-advanced-config/playwright.global-setup.ts).

The full list of added metadata information is:

- `ci`: whether the report was run with the `CI` environment variable defined or not.
- `worker-count`: the maximum number of [concurrent worker processes](https://playwright.dev/docs/api/class-testconfig#test-config-workers) used for the test run.
- `max-failures`: the [maximum number of test failures](https://playwright.dev/docs/api/class-testconfig#test-config-max-failures) for the whole test suite run.
- `retries`: the [maximum number of retry attempts](https://playwright.dev/docs/api/class-testconfig#test-config-retries) given to failed tests.
- `repo-url`: the repo's origin URL for the latest commit on the main branch.
- `browse-files-url`: the repo's origin URL for the commit hash for when the tests were executed.
- `commit-message`: the commit message of the last commit at the time the tests were executed.
- `commit-author`: the commit author of the last commit at the time the tests were executed.
- `commit-date`: the commit date of the last commit at the time the tests were executed.
- `commit-hash`: the commit hash of the last commit at the time the tests were executed.
- `commit-refs`: the commit refs of the last commit at the time the tests were executed.

> [!NOTE]
> If the the code under test is not part of a Git repo then the Git related metadata is not added.

> [!WARNING]
> The Git related metadata is built for repos hosted in GitHub. If you're hosting your repo outside of GitHub most of the Git related metadata should just work but you might have to update the code for the ones that don't look correct, such as the `browse-files-url`. The URL built for `browse-files-url` would not work if your code was hosted in [Azure DevOps](https://azure.microsoft.com/en-gb/products/devops).

### Customize the style of test tags

This example is based on the [Style Tags](https://github.com/cenfun/monocart-reporter?tab=readme-ov-file#style-tags) section of the `monocart-reporter` docs. This demo customizes the style for test tags by:

- configuring the `tags` property of the `MonocartReporterOptions` at [playwright.monocart-reporter.ts](/demos/monocart-reporter-advanced-config/playwright.monocart-reporter.ts).
- adding tags to the tests at [example.spec.ts](/demos/monocart-reporter-advanced-config/tests/example.spec.ts). For more information about tagging Playwright tests see: [Tag tests](https://playwright.dev/docs/test-annotations#tag-tests).

### Automatically collect test comments and add them to the test report

This example is based on the [Custom Fields Report](https://github.com/cenfun/monocart-reporter?tab=readme-ov-file#custom-fields-report) and [Custom Fields in Comments](https://github.com/cenfun/monocart-reporter?tab=readme-ov-file#custom-fields-in-comments) sections of the `monocart-reporter` docs. This demo automatically collects code comments from tests and adds them to the report by:

- setting the `customFieldsInComments` property of the `MonocartReporterOptions` to `true` at [playwright.monocart-reporter.ts](/demos/monocart-reporter-advanced-config/playwright.monocart-reporter.ts).
- defining a custom column named `description` on the report which will display the test comments. See the `columns` function defined in the `MonocartReporterOptions` at [playwright.monocart-reporter.ts](/demos/monocart-reporter-advanced-config/playwright.monocart-reporter.ts).
- adding test comments to the tests at [example.spec.ts](/demos/monocart-reporter-advanced-config/tests/example.spec.ts) and using the `@description` comment item. The comment item must match the name of an available column, in this case it will match the `description` custom called name created.
