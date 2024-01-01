# Which reporters should I use?

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