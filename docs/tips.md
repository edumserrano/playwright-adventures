# Playwright tips

- [Which code coverage should I use with Playwright? monocart-reporter or Istanbul with Webpack Babel plugin?](#which-code-coverage-should-i-use-with-playwright-monocart-reporter-or-istanbul-with-webpack-babel-plugin)
- [How to debug Playwright tests](#how-to-debug-playwright-tests)
- [Should you use Git LFS when you use screenshots?](#should-you-use-git-lfs-when-you-use-screenshots)
- [The `webServer.reuseExistingServer` configuration option](#the-webserverreuseexistingserver-configuration-option)
- [Which reporters should I use?](#which-reporters-should-i-use)
- [You might not need to run all your tests against all your projects](#you-might-not-need-to-run-all-your-tests-against-all-your-projects)
- [Avoid using watch mode on the target test apps](#avoid-using-watch-mode-on-the-target-test-apps)
- [What are the available devices for test projects configuration?](#what-are-the-available-devices-for-test-projects-configuration)
- [Use test parallelization even on CI](#use-test-parallelization-even-on-ci)
- [Set the filepath for screenshots](#set-the-filepath-for-screenshots)
- [webServer.url: beware of `localhost` vs `127.0.0.1` when using Node](#webserverurl-beware-of-localhost-vs-127001-when-using-node)
- [You can inject test only code into your app with `page.addInitScript`](#you-can-inject-test-only-code-into-your-app-with-pageaddinitscript)
- [Beware of font kerning/CSS issues with Visual Regression Tests](#beware-of-font-kerningcss-issues-with-visual-regression-tests)

## Which code coverage should I use with Playwright? monocart-reporter or Istanbul with Webpack Babel plugin?

[This table](https://github.com/cenfun/monocart-coverage-reports?tab=readme-ov-file#compare-reports) summarizes the differences when collecting code coverage with `Istanbul` or with `v8` as well as when using the `monocart-reporter` to convert from `v8` to `Istanbul` reports.

Perhaps the main differences between using `Istanbul` or `v8` for code coverage are:

- `v8` only works on `chromium`. That's why there's a function named `browserSupportsV8CodeCoverage` at [v8-code-coverage.ts](/demos/code-coverage-with-monocart-reporter/tests/_shared/fixtures/v8-code-coverage.ts) to only collect `v8` code coverage if the test is running on `chromium`.
- `v8` can track code coverage on HTML and CSS files whilst `Istanbul` only tracks code coverage on JavaScript files.

When you're using Playwright, the fact that `v8` code coverage only works on `chromium` shouldn't be much of a problem since it's very likely that you'll be running your tests against a `chromium` browser. This only becomes a slight issue if you have some  tests to specifically check non `chromium` browsers behaviour. If that's the case then you wouldn't be getting code coverage for those when using `v8`.

Conversely, the fact `v8` provides `html` and `CSS` coverage is usually not that important. It's useful yes, but I would argue that having `JS` code coverage and Visual Regression tests with Playwright are more than enough.

**So where does that leave us? I'd say use whatever you find easier. For me, using code coverage with `monocart-reporter` fits that. I already use `monocart-reporter` as the Playwright test results reporter so having it provide code coverage as well just makes things simple.**

Lastly, I would call out that this is not an either/or choice, if you need to, you can mix both approaches and have the code instrumented with both `v8` and `Istanbul` at the same time.

## How to debug Playwright tests

First I recommend you run the test you want to debug using [Playwright UI mode](https://playwright.dev/docs/test-ui-mode). If all the information you get from `UI mode` is not enough, then you should consider using [Playwright extension for VS Code](https://playwright.dev/docs/debug#vs-code-debugger) or similar for your editor of choice.

Alternatively, you can use the [Playwright inspector](https://playwright.dev/docs/debug#playwright-inspector) to debug tests.

> ![WARNING]
>
> If you're debugging Visual Regression tests, meaning tests that make use of screnshots, then you should be aware that screenshots might differ if they're generated from a browser in `headed` vs `headless` mode, just like they might differ when executed accross different Operating Systems.
>
> For instance, if you generate the screenshots without debug mode, which by default runs the browser in `headless` mode, and then try to debug the tests, which by default will run the browser in `headed` mode, then the screenshot comparison might fail.
>
> For more information see [microsoft/playwright [BUG] Issues with VRT tests #23559](https://github.com/microsoft/playwright/issues/23559), especially [this comment](https://github.com/microsoft/playwright/issues/23559#issuecomment-1579830160) on that issue.
>

## Should you use Git LFS when you use screenshots?

When you take screenshots with Playwright you should commit them to Git so that they can be used as the source of truth when rerunning the tests. Storing the screenshots in Git also let's you track screenshot changes over time.

However, **you should set up [Git LFS](https://git-lfs.com/) or a similar alternative** to [avoid slowing down your Git repository](https://stackoverflow.com/questions/35575400/what-is-the-advantage-of-git-lfs):

> You should use Git LFS if you need to manage large files or binary files when using Git.
>
> The reason you should use Git LFS if you manage large or binary files is that Git is decentralized. This means every developer has the full change history on their computer. Changes in large binary files cause Git repositories to grow by the size of that file every time the file is changed (and that change is committed). That means it will take a long time to get the files. And if you do, it will be difficult to version and merge the binaries.
>
> So, every time the files grow, the Git repository grows. This causes slowdowns when Git users need to retrieve and clone a repository.

See [here](https://www.atlassian.com/git/tutorials/git-lfs) to learn more about Git LFS.

> [!CAUTION]
> Check out the Git LFS costs for your hosting solution. Some like [Azure DevOps](https://azure.microsoft.com/en-gb/products/devops) provide [unlimited free storage for Git LFS](https://devblogs.microsoft.com/devops/announcing-git-lfs-on-all-vso-git-repos/). Others, like GitHub will not:
>
> - [About billing for Git Large File Storage](https://docs.github.com/en/billing/managing-billing-for-git-large-file-storage/about-billing-for-git-large-file-storage)
> - [About storage and bandwidth usage](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-storage-and-bandwidth-usage)
> - [Git lfs bandwidth limit when public repo is cloned #62051](https://github.com/orgs/community/discussions/62051)
> - [GitHub’s Large File Storage is no panacea for Open Source — quite the opposite](https://angryfrenchman.org/github-s-large-file-storage-is-no-panacea-for-open-source-quite-the-opposite-12c0e16a9a91)
> - [How does git LFS track and store binary data more efficiently than git?](https://stackoverflow.com/questions/75946411/how-does-git-lfs-track-and-store-binary-data-more-efficiently-than-git)
>
> If you have a public repo on GitHub and you want to use Git LFS and you're worried about hitting the limitations with GitHub's Git LFS, then I'd suggest configuring your Git LFS storage source to sit outside of GitHub or use [Git LFS alternatives like DVC](https://stackoverflow.com/questions/65555192/use-azure-blob-storage-for-git-lfs) which [supports many storage types](https://dvc.org/doc/command-reference/remote/modify#supported-storage-types).
>
> As to setting up the Git LFS storage to reside outside of GitHub you can find also many alternatives online. The ones I liked more were about using a [Custom Transfer Agent](https://github.com/git-lfs/git-lfs/blob/main/docs/custom-transfers.md) for Git LFS, such as [lfs-s3](https://github.com/nicolas-graves/lfs-s3).

## The `webServer.reuseExistingServer` configuration option

> [!NOTE]
>
> This only applies when running tests locally and if you are making use of the `webServer` configuration block as part of your Playwright tests configuration.
>

As per the [Playwright docs](https://playwright.dev/docs/test-webserver), the `webServer.reuseExistingServer` configuration option is described as:

> If true, it will re-use an existing server on the url when available. If no server is running on that url, it will run the command to start a new server. If false, it will throw if an existing process is listening on the url. To see the stdout, you can set the DEBUG=pw:webserver environment variable.

By default, the `webServer.reuseExistingServer` option is set to `true`, unless you are running in a CI environment. This means that you can take advantage of this option to reduce the time it takes to run Playwright tests.

What you can do is:

1) Start your app running.
2) Make sure that `webServer.url` is set to the URL the app is running on.
3) Now, everytime you run the `playwright test` command it won't have to build and start the app. It will run the tests against the app you started on step 1.

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

## You might not need to run all your tests against all your projects

In one of my projects I had a total of 9 [Playwright projects](https://playwright.dev/docs/test-projects) because the Visual Designs for the app had several differences at different resolutions and the app had to work properly on all 3 browser engines: `chromium`, `firefox` and `webkit (Safari)`.

This meant that each test we had had to be executed 9 tests, one per project, and as the number of tests grew so did the overall time to execute the test suite.

When we analyzed this problem, we came to the conclusion that not all the tests we had needed to run for all the projects. The main tests we wanted to run for all projects were the ones that did Visual Regression because we wanted to make sure the app looked as expected in all browsers and resolutions. So what we did was organize the tests into two folders:

```
tests/
├── chromium-only/
│   └── ...
└── multi-devices/
    └── ...
```

Under the `tests/chromium-only` folder we placed all the tests that didn't need to be run for all browsers/resolutions. These tests would only be executed with `chromium` with a `1920x1080` resolution. And under the `tests/multi-devices` folder we placed all the tests that should be run for all browsers/resolutions.

Lastly, we updated the [projects[].testMatch](https://playwright.dev/docs/test-projects#splitting-tests-into-projects) option of the `playwright.config.ts` so that only the project with name `desktop chromium only 1920x1080` would run the tests in the `tests/chromium-only` folder and all the other projects would run the tests in the `tests/multi-devices`:

```ts
// below is the partial content of the playwright.config.ts file
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  ...
  projects: [
    {
      name: "desktop chromium only 1920x1080",
      testMatch: /chromium-only\/.*.spec.ts/u,
      use: {
          ...devices["Desktop Chrome"],
          viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: "desktop chromium 1920x1080",
      testMatch: /multi-devices\/.*.spec.ts/u,
      use: {
          ...devices["Desktop Chrome"],
          viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: "desktop firefox 1920x1080",
      testMatch: /multi-devices\/.*.spec.ts/u,
      use: {
          ...devices["Desktop Firefox"],
          viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: "desktop safari 1920x1080",
      testMatch: /multi-devices\/.*.spec.ts/u,
      use: {
          ...devices["Desktop Safari"],
          viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: "desktop chromium 1366x1080",
      testMatch: /multi-devices\/.*.spec.ts/u,
      use: {
          ...devices["Desktop Chrome"],
          viewport: { width: 1366, height: 1080 },
          defaultBrowserType: "chromium",
      },
    },
    {
      name: "iPad Mini landscape", // this matches the 1024 width breakpoint
      testMatch: /multi-devices\/.*.spec.ts/u,
      use: {
          ...devices["iPad Mini landscape"],
          defaultBrowserType: "chromium",
      },
    },
    {
      name: "iPad Mini", // this matches the 768 width breakpoint
      testMatch: /multi-devices\/.*.spec.ts/u,
      use: {
          ...devices["iPad Mini"],
          defaultBrowserType: "chromium",
      },
    },
    {
      name: "iPhone 11 Pro", // this matches the 375 width breakpoint
      testMatch: /multi-devices\/.*.spec.ts/u,
      use: {
          ...devices["iPhone 11 Pro"],
          defaultBrowserType: "chromium",
      },
    },
  ],
  ...
});
```

**This signficantly reduced the overall time to execute our test suite.**

## Avoid using watch mode on the target test apps

When you run the target test app manually or with Playwright's [webServer](https://playwright.dev/docs/test-webserver) configuration option you should evaluate if you need to run with any kind of watch mode. If you are going to run your entire test suite then you should avoid running the target test app with a watch mode if:

- your apps's watch mode is triggered by output generated from the Playwright test suite, such as output from reporters or screenshots, and you can't configure it to ignore these.
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

## webServer.url: beware of `localhost` vs `127.0.0.1` when using Node

> [!NOTE]
>
> This only applies if you are using Node and making use of the `webServer` configuration block as part of your Playwright tests configuration.
>

If you are using Node, when configuring the [webServer.url](https://playwright.dev/docs/test-webserver) make sure the `webServer.url` and the app are both configured to use IPv4 or both configured to use IPv6. For instance, in all the demos in this repo, the Angular apps, which are used as targets of the Playwright tests, are configured to start at `http://127.0.0.1:4200/` (see the `serve.options.host` configuration value on the `angular.json files`) and the Playwright tests have the `webServer.url` set to `http://127.0.0.1:4200/`.

This avoids any errors that you might come across if you were to mix IPv4 with IPv6 addresses such as [microsoft/playwright [BUG] webServer.reuseExistingServer is broken on node 18 #24101](https://github.com/microsoft/playwright/issues/24101).

The errors you might encounter are due to a [breaking change to Node 18](https://github.com/nodejs/node/issues/40537), where Node migrated to using IPv6 by default. If you were to configure Playwright's `webServer.url` to `http://127.0.0.1:4200/` and then run your Node app at `http://localhost:4200/` then you might get issues because in Node 18 `localhost` would be resolved to an IPv6 address of `::1` and then the Playwright tests would fail because they wouldn't find anything running at `http://127.0.0.1:4200/`.

This issue with IPv4 and IPv6 doesn't seem to be a problem if you are running the tests on Unix Operating Systems.

## You can inject test only code into your app with `page.addInitScript`

You can use [page.addInitScript](https://playwright.dev/docs/api/class-page#page-add-init-script) to inject test only code into your target test app. This is what:

- the [code-coverage-with-istanbul-via-webpack-babel-plugin](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/) demo uses to add code that will [collect the code coverage instrumentation](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/tests/_shared/fixtures/istanbul-code-coverage.ts).
- the [setDate fixture](/demos/fixtures/tests/_shared/fixtures/set-date.ts) of the [fixtures](/demos/fixtures/) demo uses to add code that overrides/extends the behavior of Javascript's `Date` class so that the current date is always fixed. The `page.addInitScript` is very useful to monkey patch JavaScript functions.

Other scenarios where I injected test only code were when I didn't have an easy way to control my app's behaviour or initial state and I used the `page.addInitScript` function to set a global variable which then the app code used to control its behaviour/state. For instance:

```ts
page.addInitScript(() => {
  window.__test = true;
});
```

OR

```ts
const testData = <some-test-data>;
page.addInitScript((data) => {
  window.__testData = data;
}, testData);
```

Then in my app code I would check the `window.__test` or use the `window.__testData`. I don't particularly like this approach when it means that, in addition to the `page.addInitScript` function, I also need to add code to the app that is only meant for the tests but sometimes there isn't any other way.

## Beware of font kerning/CSS issues with Visual Regression Tests

Playwright is an awesome library but when doing Visual Regression Tests you might come accross a few issues. The ones I faced in my apps were problems with tests running on `webkit (Safari)` in certain resolutions or when running `webkit (Safari)` with [isMobile](https://playwright.dev/docs/emulation#ismobile) emulation. The two issues I encoutered were:

1) problems with font kerning. See [microsoft/playwright [Question] Font kerning in WebKit #20203](https://github.com/microsoft/playwright/issues/20203) and [microsoft/playwright [BUG] Another Font kerning issue in WebKit #23789](https://github.com/microsoft/playwright/issues/23789).
2) problems with CSS that would cause the page to be unstable and fail to take screenshots. See [microsoft/playwright [BUG] background-attachment:fixed prevents scrolling viewport on webkit with isMobile: true #23573](https://github.com/microsoft/playwright/issues/23573).

I couldn't get any acceptable workaround to overcome the above issues so in my case I chose not to run the tests that were having issues on `webkit (Safari)` below a 1920x1080 resolution.

With every new Playwright release and/or browser release you should retest any existing workarounds/limitations you might be facing because you might find that the issues have been solved.

