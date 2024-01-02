# Playwright tips

- [Which code coverage should I use with Playwright? monocart-reporter or Istanbul with Webpack Babel plugin?](#which-code-coverage-should-i-use-with-playwright-monocart-reporter-or-istanbul-with-webpack-babel-plugin)
- [Which reporters should I use?](#which-reporters-should-i-use)
- [Set the filepath for screenshots](#set-the-filepath-for-screenshots)
- [as](#as)

## Which code coverage should I use with Playwright? monocart-reporter or Istanbul with Webpack Babel plugin?

[This table](https://github.com/cenfun/monocart-coverage-reports?tab=readme-ov-file#compare-reports) summarizes the differences when collecting code coverage with `Istanbul` or with `v8` as well as when using the `monocart-reporter` to convert from `v8` to `Istanbul` reports.

Perhaps the main differences between using `Istanbul` or `v8` for code coverage are:

- `v8` only works on `chromium`. That's why there's a function named `browserSupportsV8CodeCoverage` at [v8-code-coverage.ts](/demos/code-coverage-with-monocart-reporter/tests/_shared/fixtures/v8-code-coverage.ts) to only collect `v8` code coverage if the test is running on `chromium`. 
- `v8` can track code coverage on HTML and CSS files whilst `Istanbul` only tracks code coverage on JavaScript files.

When you're using Playwright, the fact that `v8` code coverage only works on `chromium` shouldn't be much of a problem since it's very likely that you'll be running your tests against a `chromium` browser. This only becomes a slight issue if you have some  tests to specifically check non `chromium` browsers behaviour. If that's the case then you wouldn't be getting code coverage for those when using `v8`.

Conversely, the fact `v8` provides `html` and `CSS` coverage is usually not that important. It's useful yes, but I would argue that having `JS` code coverage and Visual Regression tests with Playwright are more than enough.

**So where does that leave us? I'd say use whatever you find easier. For me, using code coverage with `monocart-reporter` fits that. I already use `monocart-reporter` as the Playwright test results reporter so having it provide code coverage as well just makes things simple.**

Lastly, I would call out that this is not an either/or choice, if you need to, you can mix both approaches and have the code instrumented with both `v8` and `Istanbul` at the same time.

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

## Set the filepath for screenshots

If you're [taking screenshots with Playwright tests](https://playwright.dev/docs/test-snapshots) then you should consider setting a single parent folder to store all the screenshots instead of the default configuration which stores screenshots near the test location.

You can set the location for the screenshots by using the configuration option [snapshotDir](https://playwright.dev/docs/api/class-testproject#test-project-snapshot-dir) or [snapshotPathTemplate](https://playwright.dev/docs/api/class-testproject#test-project-snapshot-path-template). For instance:

```
snapshotPathTemplate: "{snapshotDir}/__screenshots__/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{-snapshotSuffix}{ext}",
```

By default `snapshotDir` is set to the value of [testDir](https://playwright.dev/docs/api/class-testproject#test-project-test-dir) and `testDir` by default is set to `tests`. This means that the above configuration sets the parent folder for all screenshots to `tests/__screenshots__`. The rest of the template is the same as the [default value for snapshotPathTemplate](https://github.com/microsoft/playwright/blob/7bffff5790e28243a815c985135e908247b563db/packages/playwright/src/common/config.ts#L167C5-L167C138).

You can tweak the `snapshotPathTemplate` as you prefer but setting at least a parent folder for all screenshots makes it very easy to delete/browse them all if you need to.

## as

