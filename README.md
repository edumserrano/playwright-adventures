# Playwright adventures

- [Description](#description)
- [Playwright demos](#playwright-demos)
- [Tips](#tips)
- [Learn more about Playwright](#learn-more-about-playwright)

## Description

This repo aims to consolidate and share some of the experiences I've had and the solutions I've come up with whilst using Playwright to test Angular apps. 

> [!IMPORTANT]
>
> Although the code demos presented here use Angular, the Playwright concepts that are demoed are frontend framework agnostic which means they and can be applied to any frontend framework.

## Playwright demos

| Demo                                                                                                                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| :---------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [code-coverage-with-monocart-reporter](/demos/code-coverage-with-monocart-reporter/README.md)                                 | Playwright code coverage using [monocart-reporter](https://github.com/cenfun/monocart-reporter).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [code-coverage-with-istanbul-via-webpack-babel-plugin](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/README.md) | Playwright code coverage using [Istanbul via Webpack Babel plugin](https://github.com/istanbuljs/babel-plugin-istanbul).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| [docker](/demos/docker/README.md)                                                                                             | Run Playwright tests in Docker. Also shows how to use Playwright tests UI mode in Docker. Especially helpful to eliminate screenshot differences when running the tests across different Operating Systems. For instance, if you develop in Windows but your CI runs on Linux.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| [stale-screenshots-cleanup](/demos/stale-screenshots-cleanup/README.md)                                                       | Delete stale Playwright test screenshots.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| [fixtures](/demos/fixtures/README.md)                                                                                         | Shows useful Playwright fixtures you can reuse: <br/>- [time/date emulation](/demos/fixtures/README.md#timedate-emulation): so that you can do reliable asserts on screenshots or text that contains time/date information; <br/>- [capture console messages](/demos/fixtures/README.md#capture-console-messages): so that you can assert on console messages. <br/>- [fail tests upon unexpected console messages](/demos/fixtures/README.md#fail-tests-upon-unexpected-console-messages): allows you to define allowed console messages and will fail the tests if any unexpected console message is produced. Good to catch left over debug/temp console messages. <br/>- [capture page error](/demos/fixtures/README.md#capture-page-errors): so that you can assert on uncaught exceptions. <br/>- [fail tests on page errors](/demos/fixtures/README.md#fail-tests-on-page-errors): fails tests if any uncaught exception is produced. <br/>- [project name](/demos/fixtures/README.md#project-name): allows you to control test behaviour depending on the Playwright project. <br/>- [annotations](/demos/fixtures/README.md#custom-annotations): shows how to add custom annotations to tests. |
| [monocart-reporter-advanced-config](/demos/monocart-reporter-advanced-config/README.md)                                       | Shows some advanced features of the [monocart-reporter](https://github.com/cenfun/monocart-reporter) HTML report: <br/> - report metadata. <br/>- test tag styles. <br/>- auto collection of code comments.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| [accessibility-axe](/demos/accessibility-axe/README.md)                                                                       | How to use Playwright for [accessiblity testing](https://playwright.dev/docs/accessibility-testing) using the [@axe-core/playwright](https://www.npmjs.com/package/@axe-core/playwright) npm package.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| [accessibility-lighthouse](/demos/accessibility-lighthouse/README.md)                                                         | How to use Playwright for accessiblity testing using [lighthouse](https://www.npmjs.com/package/lighthouse).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

## Tips

- [Which code coverage should I use with Playwright? monocart-reporter or Istanbul with Webpack Babel plugin?](/docs/v8-vs-istanbul.md)
- [Which reporters should I use?](/docs/reporters.md)

## Learn more about Playwright

- [Playwright docs](https://playwright.dev/docs/intro): official documentation.
- [Playwright API reference](https://playwright.dev/docs/api/class-playwright): official API reference.
- [Playwright's YoutTube channel](https://www.youtube.com/@Playwrightdev): small sized videos about what's new with each Playwright release. Great way to keep up to date.
- [Learn Playwright - Resources for learning end-to-end testing using Playwright automation framework](https://ray.run/): great curated collection of Playwright resources. From blogs, to FAQS, to videos, etc.
- [CommitQuality Playwright's YouTube Playlist](https://www.youtube.com/playlist?list=PLXgRgGX8-5UVm9yioRY329rfcfy3MusiY): small sized tutorials that will help you master Playwright.
- [Playwright's Discord channel](https://discord.com/servers/playwright-807756831384403968): great for interacting with community members and asking questions.
- [Playwright's GitHub issues](https://github.com/microsoft/playwright/issues): always worth searching through when you're trying to learn new concepts or in case others have faced some problem you might be facing. 
