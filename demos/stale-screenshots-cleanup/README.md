# Cleanup Playwright stale screenshots

- [Description](#description)
- [Do I really need a solution to clean stale screenshots?](#do-i-really-need-a-solution-to-clean-stale-screenshots)
- [How to build, run the app, run tests and view the test results](#how-to-build-run-the-app-run-tests-and-view-the-test-results)
- [Playwright configuration](#playwright-configuration)
- [Delete stale Playwright screenshots](#delete-stale-playwright-screenshots)
  - [The clean-stale-screenshots.ps1 script](#the-clean-stale-screenshotsps1-script)
  - [How to control the directory where screenshots are created](#how-to-control-the-directory-where-screenshots-are-created)
  - [clean-stale-screenshots.ps1 script parameters](#clean-stale-screenshotsps1-script-parameters)
  - [Last notes on the clean-stale-screenshots.ps1 script](#last-notes-on-the-clean-stale-screenshotsps1-script)

## Description

The demo at [/demos/stale-screenshots-cleanup](/demos/stale-screenshots-cleanup/) shows a custom made script that is able to delete stale Playwright screenshots. As of writing this, there's an open issue asking for built-in Playwright support for this type of functionality. See [microsoft/playwright [Question] Does testConfig.updateSnapshots have the ability to remove stale snapshots? #16582](https://github.com/microsoft/playwright/issues/16582).

> [!NOTE]
>
> The script implemented in this demo is based on the work done by [@brodie124](https://github.com/brodie124). The version he created, which you can see on this [gist](https://gist.github.com/edumserrano/5e878002c7dfb40d3126e28dbb29dd42) had a limitation in the fact that it required Playwright to be configured in a very specific way for it to work (see the notes on the top of the linked gist).
>
> The script in this demo is more versatile and doesn't have that limitation.
>
> Thank you [@brodie124](https://github.com/brodie124)!

## Do I really need a solution to clean stale screenshots?

You could argue that if you want to delete stale screenshots that you could just delete the screenshots folder and rerun the tests. Yes, I mean delete **ALL** screenshots and run the tests again to recreate them.

This process relies of course on using some form of source control for your screenshots. After you recreate the screenshots your source control would let you know which ones are stale because they would show up as files to delete from source control.

> [!CAUTION]
>
> If you use this process and you end up with some changed screenshots then something isn't quite right. It might mean you have some flaky tests that don't always produce the expected screenshots.

If you feel that recreating all the screenshots is a viable process for you then there's no need to read any further. However, if you're looking for something slightly better then this demo provides an alternative solution. One that not only allows you do delete stale snapshots but that could be used as a check in your CI environment to fail a pipeline or warn the developer if stale screenshots are detected.

> [!TIP]
>
> If you want to recreate all the screenshots after deleting them, then add the [--update-snapshots](https://playwright.dev/docs/test-cli#reference) CLI option to the `playwright test` command: `npx playwright test --update-snapshots`.
>
> This will make it so that your tests don't fail when recreating the screenshots, which is especially useful if you have tests that generate more than one screenshot. Otherwise, you might have to run the `npx playwright test` command several times untill ass screenshots are recreated.

## How to build, run the app, run tests and view the test results

> [!IMPORTANT]
>
> Required dependencies:
>
> - [Node](https://nodejs.org/en/blog/release/v20.10.0). Tested working with `v20.10.0`. If you need to have different versions of node installed it's recommended that you use [Node Version Manager](https://github.com/nvm-sh/nvm) to install and swap between node versions.
> - [npm@latest](https://www.npmjs.com/package/npm): package manager used on the demos. Tested working on `10.2.5`.
> - [Git LFS](https://git-lfs.com/): this demo takes screenshots and those images are uploaded to the repo using Git LFS. Without Git LFS you won't get any images when cloning the repo and the Playwright tests will fail. Tested working with `3.3.0`.
> - [VS Code](https://code.visualstudio.com/download) is recommended as a code editor but you can use whatever you prefer.

1. Clone the repo.
2. Using your favorite shell go to `/demos/stale-screenshots-cleanup`.
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
   This will start the app and run the [playwright tests](/demos/stale-screenshots-cleanup/tests/example.spec.ts) against it.
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

The majority of the content of the [playwright.config.ts](/demos/stale-screenshots-cleanup/playwright.config.ts) file is what you get by default after [adding Playwright to your project](https://playwright.dev/docs/intro#installing-playwright) with `npm init playwright@latest`.

The main changes are:

1. Declared a few variables at the start that are reused throughout the playwright configuration.
2. Updated the `reporter` array. Added the [built-in list reporter](https://playwright.dev/docs/test-reporters#list-reporter) to the [default html reporter](https://playwright.dev/docs/test-reporters#html-reporter).
3. Defined a [baseURL](https://playwright.dev/docs/test-webserver#adding-a-baseurl) so that we can use relative URLs when doing page navigations on the tests.
4. Configured the `webServer` block to run the Angular app locally so that the tests can be executed against it. If you're not testing an Angular app that's fine, you just need to adjust the `webServer.command` so that it launches your app and set the `webServer.url` to the url your app will be running at. For more information see the [webServer docs](https://playwright.dev/docs/test-webserver).

> [!NOTE]
>
> The `_isRunningOnCI` variable used on the `playwright.config.ts` changes the value of some options when running tests on CI. To set the `_isRunningOnCI` variable to `true` you must set the environment variable `CI` to `true` before running the tests. For more information regarding using Playwright on a CI environment see [Playwright docs on Continuous Integration](https://playwright.dev/docs/ci).

Furthermore, we have created:

- a [playwright.shared-vars.ts](/demos/stale-screenshots-cleanup/playwright.shared-vars.ts) file: to share some variables across the Playwright configuration.
- a [playwright.cli-options.ts](/demos/stale-screenshots-cleanup/playwright.cli-options.ts) file: to represent Playwright CLI options we care about.
- a [playwright.env-vars.ts](/demos/stale-screenshots-cleanup/playwright.env-vars.ts) file: to represent environment variables we care about.

> [!NOTE]
>
> You don't have to create the `playwright.shared-vars.ts`, the `playwright.cli-options.ts` or the `playwright.env-vars.ts` file. You can have all of this on the `playwright.config.ts`. Code structure is up to you.

> [!NOTE]
>
> Depending on your `playwright.config.ts`, make sure you update your `.gitignore` to exclude any directory used by test results, report results, etc. Scroll to the end of this demo's [.gitignore](/demos/stale-screenshots-cleanup/.gitignore) to see an example.

## Delete stale Playwright screenshots

> [!IMPORTANT]
>
> Make sure you have installed the required npm packages and Playwright browsers before proceeding. See the [How to build, run the app and run tests](#how-to-build-run-the-app-and-run-tests) section.

When you clone the repo there won't be any stale screenshots to delete. To generate some stale screenshots go to the [example.spec.ts](/demos/stale-screenshots-cleanup/tests/example.spec.ts) file and comment the second test named `test-two`. This will mean that now you have 3 stale screenshots:

- [test-two-1-chromium-win32.png](tests/__screenshots__/example.spec.ts-snapshots/test-two-1-chromium-win32.png)
- [test-two-1-firefox-win32.png](tests/__screenshots__/example.spec.ts-snapshots/test-two-1-firefox-win32.png)
- [test-two-1-webkit-win32.png](tests/__screenshots__/example.spec.ts-snapshots/test-two-1-webkit-win32.png)

To get a report on the stale screenshots run the `test:clean-screenshots` command with the `-dryRun` switch:

```
npm run test:clean-screenshots '--' -dryRun
```

To delete the stale screenshots run without the `-dryRun` switch:

```
npm run test:clean-screenshots
```

To get back to the initial state, undo all local changes you have on this repo or uncomment `test-two` and run `npm test` to generate the deleted screenshots.

### The clean-stale-screenshots.ps1 script

> [!NOTE]
>
> This demo used Powershell to create the script that deletes stale snapshots but you can implement this logic in whatever language of your choice. Hopefully this demo provides you with the required building blocks.

The logic to detect and delete stale snapshots is implemented by the [clean-stale-screenshots.ps1](/demos/stale-screenshots-cleanup/npm-pwsh-scripts/clean-stale-screenshots.ps1) Powershell script. The idea behind it is pretty simple:

- Run the Playwright tests but set a different directory to save the screenshots, a temp directory.
- Once the screenshots are generated in the temp directory, compare them with the screenshots from the actual screenshots directory.
- Any screenshots found in the actual directory that aren't in the temp directory are the stale screenshots.

Let's quickly run through this logic using the code in this demo. When you clone this repo, the screenshot directory for the tests contains the following files:

```
tests/
└── __screenshots__/
    └── example.spec.ts-snapshots/
        ├── test-one-1-chromium-win32.png
        ├── test-one-1-firefox-win32.png
        ├── test-one-1-webkit-win32.png
        ├── test-two-1-chromium-win32.png
        ├── test-two-1-firefox-win32.png
        └── test-two-1-webkit-win32.png
```

To create stale screenshots you can go to the [example.spec.ts](/demos/stale-screenshots-cleanup/tests/example.spec.ts) file and comment the second test named `test-two`. Now, the `test-two-1-<...>.png` files are stale screenshots. To detect them what we do is run the `playwright test` command but specify a temp directory to store the screenshots. This demo uses the `./tests/__temp-screenshots__` directory which means that when the tests run we get the following screenshots:

```
tests/
└── __temp-screenshots__/
    └── example.spec.ts-snapshots/
        ├── test-one-1-chromium-win32.png
        ├── test-one-1-firefox-win32.png
        └── test-one-1-webkit-win32.png
```

The last step is to compare these two directories and find the screenshots that exist on the actual screenshots directory but not on the temp directory. In the end we delete the temp screenshots directory.

### How to control the directory where screenshots are created

To control where Playwright generates the screenshots, the `clean-stale-screenshots.ps1` script sets the `SNAPSHOT_DIR` environment variable which is used to define the [snapshotDir](https://playwright.dev/docs/api/class-testproject#test-project-snapshot-dir) in the [playwright.config.ts](/demos/stale-screenshots-cleanup/playwright.config.ts).

> [!CAUTION]
>
> Setting the [snapshotDir](https://playwright.dev/docs/api/class-testproject#test-project-snapshot-dir) is enough to control where the screenshots are generated because [by default](https://github.com/microsoft/playwright/blob/main/packages/playwright/src/common/config.ts#L167C4-L167C4) the [snapshotPathTemplate](https://playwright.dev/docs/api/class-testproject#test-project-snapshot-path-template) uses the `snapshotDir` as the root directory for the screenshots. If you set the `snapshotPathTemplate` in your `playwright.config.ts` to something different than the default, then you might have to revisit it or adjust this script.

### clean-stale-screenshots.ps1 script parameters

Once you can control where the screenshots are generated then you just have to pass that to the `clean-stale-screenshots.ps1` as well as the current directory for the screenshots.

The parameters in the `clean-stale-screenshots.ps1` are:

- `snapshotDir`: the current directory for the screenshots.
- `tempSnapshotDir`: the temp directory where screenshots will be generated and then used to do the comparison for stale screenshots.
- `dryRun`: switch that if set will only report on stale snapshots, it won't delete them. Defaults to `$false`.
- `maxAttempts`: we need to run `npx playwright test` to generate the snapshots in a temp directory. Usually all will go well at the first run but sometimes it doesn't and this parameters let's you set a number of attempts to generate the screenhots. Defaults to 5.

### Last notes on the clean-stale-screenshots.ps1 script

- to generate the screenshots in a temp directory, the `clean-stale-screenshots.ps1` Powershell script runs the following command: `npx playwright test --update-snapshots`. The `--update-snapshots` options is used so that the tests that generate screenshots don't fail when generating the screenshots in the temp directory. Furthermore, **if you require other [command line options](https://playwright.dev/docs/test-cli#reference) when running your Playwright tests then you should adjust the command in the `clean-stale-screenshots.ps1` script accordingly**.
- this script is running all the tests but you could extend it to use the [--grep](https://playwright.dev/docs/test-cli#reference) command line option of the `playwright test` command to only run a subset of your tests where you wish to delete stale screenshots.
