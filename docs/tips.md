# Playwright tips

- [Which code coverage should I use with Playwright? monocart-reporter or Istanbul with Webpack Babel plugin?](#which-code-coverage-should-i-use-with-playwright-monocart-reporter-or-istanbul-with-webpack-babel-plugin)
- [Use Git LFS when you use screenshots](#use-git-lfs-when-you-use-screenshots)
- [Which reporters should I use?](#which-reporters-should-i-use)
- [Avoid using watch mode on the target test apps](#avoid-using-watch-mode-on-the-target-test-apps)
- [What are the available devices for test projects configuration?](#what-are-the-available-devices-for-test-projects-configuration)
- [Use test parallelization even on CI](#use-test-parallelization-even-on-ci)
- [Set the filepath for screenshots](#set-the-filepath-for-screenshots)

## Which code coverage should I use with Playwright? monocart-reporter or Istanbul with Webpack Babel plugin?

[This table](https://github.com/cenfun/monocart-coverage-reports?tab=readme-ov-file#compare-reports) summarizes the differences when collecting code coverage with `Istanbul` or with `v8` as well as when using the `monocart-reporter` to convert from `v8` to `Istanbul` reports.

Perhaps the main differences between using `Istanbul` or `v8` for code coverage are:

- `v8` only works on `chromium`. That's why there's a function named `browserSupportsV8CodeCoverage` at [v8-code-coverage.ts](/demos/code-coverage-with-monocart-reporter/tests/_shared/fixtures/v8-code-coverage.ts) to only collect `v8` code coverage if the test is running on `chromium`.
- `v8` can track code coverage on HTML and CSS files whilst `Istanbul` only tracks code coverage on JavaScript files.

When you're using Playwright, the fact that `v8` code coverage only works on `chromium` shouldn't be much of a problem since it's very likely that you'll be running your tests against a `chromium` browser. This only becomes a slight issue if you have some  tests to specifically check non `chromium` browsers behaviour. If that's the case then you wouldn't be getting code coverage for those when using `v8`.

Conversely, the fact `v8` provides `html` and `CSS` coverage is usually not that important. It's useful yes, but I would argue that having `JS` code coverage and Visual Regression tests with Playwright are more than enough.

**So where does that leave us? I'd say use whatever you find easier. For me, using code coverage with `monocart-reporter` fits that. I already use `monocart-reporter` as the Playwright test results reporter so having it provide code coverage as well just makes things simple.**

Lastly, I would call out that this is not an either/or choice, if you need to, you can mix both approaches and have the code instrumented with both `v8` and `Istanbul` at the same time.

## Use Git LFS when you use screenshots

When you take screenshots with Playwright you should commit them to Git so that they can be used as the source of truth when rerunning the tests. Storing the screenshots in Git also let's you track screenshot changes over time.

However, you should set up [Git LFS](https://git-lfs.com/) to [avoid slowing down your Git repository](https://stackoverflow.com/questions/35575400/what-is-the-advantage-of-git-lfs):

> You should use Git LFS if you need to manage large files or binary files when using Git.
>
> The reason you should use Git LFS if you manage large or binary files is that Git is decentralized. This means every developer has the full change history on their computer. Changes in large binary files cause Git repositories to grow by the size of that file every time the file is changed (and that change is committed). That means it will take a long time to get the files. And if you do, it will be difficult to version and merge the binaries.
>
> So, every time the files grow, the Git repository grows. This causes slowdowns when Git users need to retrieve and clone a repository.

See [here](https://www.atlassian.com/git/tutorials/git-lfs) to learn more about Git LFS.

## Which reporters should I use?

After [adding Playwright to your project](https://playwright.dev/docs/intro#installing-playwright) with `npm init playwright@latest`, a file named `playwright.config.ts` will be created for you with a default configuration for Playwright.

In this file you will find a [reporters section](https://playwright.dev/docs/test-reporters) which by default, as of writing this, is configured to use the [built-in html reporter](https://playwright.dev/docs/test-reporters#html-reporter). You should review the available reporters and choose the ones that best fit your case but I think you should at least consider:

- adding the [built-in list reporter](https://playwright.dev/docs/test-reporters#list-reporter) which provides a human readable summary of your test results as the output to the `npx playwright test` command. It's also a very useful reporter for CI environments.
- replacing the [built-in html reporter](https://playwright.dev/docs/test-reporters#html-reporter) with the more advanced and configurable [third party HTML reporter](https://playwright.dev/docs/test-reporters#third-party-reporter-showcase) named [monocart-reporter](https://github.com/cenfun/monocart-reporter).

I can't praise enough [@cenfun](https://github.com/cenfun)'s work in creating the [monocart-reporter npm package](https://www.npmjs.com/package/monocart-reporter) and the work he keeps putting on it to keep improving it. He's also very responsive to the issues you create on the repo and quickly addresses any bugs that are reported. I mean, just check [the conversations over GitHub issues](https://github.com/cenfun/monocart-reporter/issues?q=is%3Aissue+author%3Aedumserrano+) I've been having with him since I've discovered this library.

For some usage examples see the following demos:

- [code-coverage-with-monocart-reporter](/demos/code-coverage-with-monocart-reporter/)
- [monocart-reporter-advanced-config](/demos/monocart-reporter-advanced-config/)
- [accessibility-lighthouse](/demos/accessibility-lighthouse/)

**Also, take a look at the [table of contents for the monocart-reporter's documentation](https://github.com/cenfun/monocart-reporter?tab=readme-ov-file#monocart-reporter) to understand the breadth of options this HTML reporter gives you.**

## Avoid using watch mode on the target test apps

When you run the target test app manually or with Playwright's [webServer](https://playwright.dev/docs/test-webserver) configuration option you should consider running without any kind watch mode if possible. You should do this if:

- your apps's watch mode is triggered by output generated from the Playwright reporters or screenshots and you can't configure it to ignore these.
- you want to avoid tests failing because you've accidentally changed the app's code whilst the tests are running and the watch mode rebuilt the app.

If you check any of the demos in this repo you will see that the `webServer.command` is set like:

```
const _webServerCommand = playwrightCliOptions.UIMode
  ? `npx ng serve --host ${_webServerHost} --port ${_webServerPort}`
  : `npx ng serve --host ${_webServerHost} --port ${_webServerPort} --watch false`;
```

Which will only use the watch mode if the Playwright tests are executed using the [UI mode](https://playwright.dev/docs/test-ui-mode). When running with `UI mode` what you usually want is to incorporate it into your dev loop so that you can change the app code, add/update tests and then run them. If you don't use a watch mode then Playwright's `UI mode` won't pick up the updated the tests or app code.

## What are the available devices for test projects configuration?

Playwright Test supports running [multiple test projects](https://playwright.dev/docs/api/class-testproject) at the same time. This is useful for running tests in multiple configurations.

For the full list of built-in devices used to setup test projects see [deviceDescriptorsSource.json](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json).

## Use test parallelization even on CI

By default, the `playwright.config.ts` will set the [workers](https://playwright.dev/docs/test-parallel) configuration option to:
```
workers: process.env.CI ? 1 : undefined
```

Which opts out of parallel tests when running the tests on CI environments. [According to the Playwright docs](https://playwright.dev/docs/ci#workers), the default config does this because:

> We recommend setting workers to "1" in CI environments to prioritize stability and reproducibility. Running tests sequentially ensures each test gets the full system resources, avoiding potential conflicts. However, if you have a powerful self-hosted CI system, you may enable parallel tests. For wider parallelization, consider sharding - distributing tests across multiple CI jobs.

I advise you to start by setting the workers to `undefined`, meaning running as much parallel tests as available cores. Only limit it in CI if you do face stability and reproducibility issues. **Running tests in parallel will drastically reduce the time it takes to run your Playwright test suite.**

## Set the filepath for screenshots

If you're [taking screenshots with Playwright tests](https://playwright.dev/docs/test-snapshots) then you should consider setting a single parent folder to store all the screenshots instead of the default configuration which stores screenshots near the test location.

You can set the location for the screenshots by using the configuration option [snapshotDir](https://playwright.dev/docs/api/class-testproject#test-project-snapshot-dir) or [snapshotPathTemplate](https://playwright.dev/docs/api/class-testproject#test-project-snapshot-path-template). For instance:

```
snapshotPathTemplate: "{snapshotDir}/__screenshots__/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{-snapshotSuffix}{ext}",
```

By default `snapshotDir` is set to the value of [testDir](https://playwright.dev/docs/api/class-testproject#test-project-test-dir) and `testDir` by default is set to `tests`. This means that the above configuration sets the parent folder for all screenshots to `tests/__screenshots__`. The rest of the template is the same as the [default value for snapshotPathTemplate](https://github.com/microsoft/playwright/blob/7bffff5790e28243a815c985135e908247b563db/packages/playwright/src/common/config.ts#L167C5-L167C138).

You can tweak the `snapshotPathTemplate` as you prefer but setting at least a parent folder for all screenshots makes it very easy to delete/browse them all if you need to.

